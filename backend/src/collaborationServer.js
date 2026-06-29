// import 'dotenv/config';
// import express from 'express';
// import http from 'http';
// import { WebSocketServer } from 'ws';
// import { Server as SocketIOServer } from 'socket.io';
// import { createRequire } from 'module';
// import * as Y from 'yjs';

// const require = createRequire(import.meta.url);
// const { setupWSConnection, setPersistence, docs } = require('y-websocket/bin/utils');

// import redis from './config/redis.js';
// import File from './models/File.js';
// import connectDB from './config/db.js';

// connectDB();

// const PORT       = process.env.COLLAB_PORT || 3001;
// const CLIENT_URL = process.env.CLIENT_URL;
// const MAX_USERS  = 5;
// const ROOM_TTL   = 7200;          // 2h Redis TTL for room metadata
// const AUTOCLOSE_MS = 2 * 60 * 60 * 1000; // hard 2h auto-end
// const DEBOUNCE_MS  = 2000;        // debounced Mongo autosave

// const app = express();
// app.use(express.json());
// app.get('/health', (_, res) =>
//   res.json({ status: 'ok', service: 'collaboration', timestamp: new Date().toISOString() })
// );

// const server = http.createServer(app);
// const wss = new WebSocketServer({ noServer: true });

// // Map<roomName, fileId>  — set when host creates room (or recovered from Redis)
// const roomFileMap = new Map();
// // Map<roomName, NodeJS.Timeout> for debounced saves
// const saveTimers = new Map();
// // Map<roomName, NodeJS.Timeout> for 2h auto-close
// const autoCloseTimers = new Map();

// // ────────────────────────────────────────────────────────────────────────────
// //  Yjs persistence: load from / save to MongoDB
// // ────────────────────────────────────────────────────────────────────────────
// setPersistence({
//   bindState: async (docName, ydoc) => {
//     // docName == roomId
//     let fileId = roomFileMap.get(docName);
//     if (!fileId) {
//       try {
//         const metaRaw = await redis.get(`room:${docName}:meta`);
//         if (metaRaw) {
//           const meta = JSON.parse(metaRaw);
//           if (meta.fileId) {
//             fileId = meta.fileId;
//             roomFileMap.set(docName, fileId);
//           }
//         }
//       } catch (e) { /* ignore */ }
//     }
//     if (fileId) {
//       try {
//         const file = await File.findById(fileId).select('code');
//         if (file && ydoc.getText('monaco').length === 0 && file.code) {
//           ydoc.transact(() => {
//             ydoc.getText('monaco').insert(0, file.code);
//           });
//         }
//       } catch (err) {
//         console.error(`[yjs] bindState load failed for room ${docName}:`, err.message);
//       }
//     }

//     // Debounced autosave on every doc update
//     const onUpdate = () => scheduleSave(docName, ydoc);
//     ydoc.on('update', onUpdate);
//     ydoc._collabOnUpdate = onUpdate;

//     // Start 2h auto-close timer
//     armAutoClose(docName);
//   },
//   writeState: async (docName, ydoc) => {
//     // Called when last connection closes — flush immediately
//     if (ydoc._collabOnUpdate) ydoc.off('update', ydoc._collabOnUpdate);
//     const t = saveTimers.get(docName);
//     if (t) clearTimeout(t);
//     saveTimers.delete(docName);
//     await flushSave(docName, ydoc);
//   },
// });

// function scheduleSave(docName, ydoc) {
//   const existing = saveTimers.get(docName);
//   if (existing) clearTimeout(existing);
//   const t = setTimeout(() => {
//     saveTimers.delete(docName);
//     flushSave(docName, ydoc).catch((err) =>
//       console.error(`[yjs] save error room ${docName}:`, err.message)
//     );
//   }, DEBOUNCE_MS);
//   saveTimers.set(docName, t);
// }

// async function flushSave(docName, ydoc) {
//   const fileId = roomFileMap.get(docName);
//   if (!fileId) return;
//   const code = ydoc.getText('monaco').toString();
//   try {
//     await File.findByIdAndUpdate(fileId, { code, updatedAt: new Date() });
//     console.log(`[yjs] saved room ${docName} → file ${fileId} (${code.length} chars)`);
//   } catch (err) {
//     console.error(`[yjs] mongo save failed room ${docName}:`, err.message);
//   }
// }

// function armAutoClose(docName) {
//   if (autoCloseTimers.has(docName)) return;
//   const t = setTimeout(async () => {
//     autoCloseTimers.delete(docName);
//     console.log(`[autoclose] room ${docName} hit 2h limit — closing`);
//     io.to(docName).emit('room-closed', { message: 'Session auto-ended after 2 hours.' });
//     await teardownRoom(docName);
//   }, AUTOCLOSE_MS);
//   autoCloseTimers.set(docName, t);
// }

// async function teardownRoom(roomId) {
//   // flush pending save + destroy yjs doc
//   const ydoc = docs.get(roomId);
//   if (ydoc) {
//     const t = saveTimers.get(roomId);
//     if (t) clearTimeout(t);
//     saveTimers.delete(roomId);
//     try { await flushSave(roomId, ydoc); } catch {}
//     ydoc.destroy();
//     docs.delete(roomId);
//   }
//   const at = autoCloseTimers.get(roomId);
//   if (at) clearTimeout(at);
//   autoCloseTimers.delete(roomId);
//   roomFileMap.delete(roomId);
//   await cleanupRoom(roomId);

//   // disconnect all sockets from the room
//   const socketsInRoom = await io.in(roomId).fetchSockets();
//   socketsInRoom.forEach((s) => s.leave(roomId));
// }

// // ────────────────────────────────────────────────────────────────────────────
// //  WebSocket upgrade for /yjs/<roomId>
// //
// //  IMPORTANT: y-websocket's setupWSConnection derives the docName from
// //  req.url.slice(1).split('?')[0]. The client connects to /yjs/<roomId>,
// //  so without rewriting we'd get docName === "yjs/<roomId>" and the
// //  roomFileMap (keyed by raw roomId) would never match → initial code
// //  would never load from Mongo. Strip the /yjs/ prefix so docName === roomId.
// // ────────────────────────────────────────────────────────────────────────────
// wss.on('connection', (conn, req) => setupWSConnection(conn, req));

// server.on('upgrade', (request, socket, head) => {
//   const url = new URL(request.url, 'http://localhost');
//   if (url.pathname.startsWith('/yjs/')) {
//     const roomId = url.pathname.slice('/yjs/'.length);
//     request.url = '/' + roomId + url.search; // docName becomes just roomId
//     wss.handleUpgrade(request, socket, head, (ws) => wss.emit('connection', ws, request));
//   } else if (url.pathname === '/yjs' || url.pathname === '/yjs/') {
//     socket.destroy(); // missing room id
//   }
// });

// // ────────────────────────────────────────────────────────────────────────────
// //  Socket.IO presence + control channel
// // ────────────────────────────────────────────────────────────────────────────
// const io = new SocketIOServer(server, {
//   cors: { origin: CLIENT_URL, methods: ['GET', 'POST'], credentials: true },
// });

// const rKeys = {
//   users:    (r) => `room:${r}:users`,
//   lang:     (r) => `room:${r}:lang`,
//   host:     (r) => `room:${r}:host`,
//   hostUser: (r) => `room:${r}:hostUserId`,
//   meta:     (r) => `room:${r}:meta`,
// };

// const refreshTTL = async (roomId) => {
//   await Promise.all(Object.values(rKeys).map((fn) => redis.expire(fn(roomId), ROOM_TTL)));
// };

// const getUsersList = async (roomId, hostSocketId) => {
//   const raw = await redis.hgetall(rKeys.users(roomId));
//   if (!raw) return [];
//   return Object.entries(raw)
//     .map(([socketId, username]) => ({ socketId, username, isHost: socketId === hostSocketId }))
//     .sort((a, b) => a.socketId.localeCompare(b.socketId));
// };

// const broadcastUsers = async (roomId) => {
//   const hostSocketId = await redis.get(rKeys.host(roomId));
//   const users        = await getUsersList(roomId, hostSocketId);
//   io.to(roomId).emit('users-update', { users });
//   return users;
// };

// const cleanupRoom = async (roomId) => {
//   await Promise.all(Object.values(rKeys).map((fn) => redis.del(fn(roomId))));
// };

// const removeUserFromRoom = async (roomId, socketId) => {
//   if (!roomId) return;
//   await redis.hdel(rKeys.users(roomId), socketId);
//   const remaining = await redis.hlen(rKeys.users(roomId));
//   if (remaining === 0) {
//     await cleanupRoom(roomId);
//     io.to(roomId).emit('users-update', { users: [] });
//     return;
//   }
//   await broadcastUsers(roomId);
// };

// io.on('connection', (socket) => {
//   console.log('connected:', socket.id);

//   socket.on('join-room', async ({
//     roomId, username, userId,
//     createIfMissing, language,
//     fileName, fileId,
//   }) => {
//     if (!roomId || !username) return;

//     const roomExists = await redis.exists(rKeys.lang(roomId));

//     if (!roomExists) {
//       if (!createIfMissing) {
//         socket.emit('room-not-found');
//         return;
//       }
//       await redis.set(rKeys.lang(roomId),     language || 'cpp');
//       await redis.set(rKeys.host(roomId),     socket.id);
//       await redis.set(rKeys.hostUser(roomId), userId || '');
//       await redis.set(rKeys.meta(roomId), JSON.stringify({
//         fileName: fileName || 'Untitled',
//         fileId:   fileId   || null,
//       }));
//       await refreshTTL(roomId);
//       if (fileId) roomFileMap.set(roomId, fileId);
//       console.log(`Room ${roomId} created by ${username}, fileId: ${fileId}`);
//     }

//     const userCount = await redis.hlen(rKeys.users(roomId));
//     if (userCount >= MAX_USERS) {
//       socket.emit('room-full');
//       return;
//     }

//     await redis.hset(rKeys.users(roomId), socket.id, username);
//     socket.join(roomId);
//     socket.data.roomId   = roomId;
//     socket.data.username = username;
//     await refreshTTL(roomId);

//     const hostSocketId    = await redis.get(rKeys.host(roomId));
//     const currentLanguage = await redis.get(rKeys.lang(roomId));
//     const metaRaw         = await redis.get(rKeys.meta(roomId));
//     const meta            = metaRaw ? JSON.parse(metaRaw) : {};
//     const users           = await getUsersList(roomId, hostSocketId);
//     const isHost          = socket.id === hostSocketId;

//     socket.emit('room-joined', {
//       roomId,
//       users,
//       language:  currentLanguage,
//       isHost,
//       fileName:  meta.fileName || 'Untitled',
//     });

//     io.to(roomId).emit('users-update', { users });
//   });

//   socket.on('close-room', async ({ roomId }) => {
//     if (!roomId) return;
//     const hostSocketId = await redis.get(rKeys.host(roomId));
//     if (socket.id !== hostSocketId) return;

//     console.log(`Room ${roomId} closed by host`);
//     io.to(roomId).emit('room-closed', { message: 'Host ended the session.' });
//     await teardownRoom(roomId);
//   });

//   socket.on('leave-room', async ({ roomId }) => {
//     const target = roomId || socket.data.roomId;
//     if (!target) return;
//     await removeUserFromRoom(target, socket.id);
//     socket.leave(target);
//   });

//   socket.on('language-change', async ({ roomId, language }) => {
//     if (!roomId || !language) return;
//     await redis.set(rKeys.lang(roomId), language);
//     socket.to(roomId).emit('language-change', { language });
//   });

//   socket.on('disconnecting', async () => {
//     const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
//     await Promise.all(rooms.map((r) => removeUserFromRoom(r, socket.id)));
//   });

//   socket.on('disconnect', () => console.log('disconnected:', socket.id));
// });

// server.listen(PORT, () => {
//   console.log(`Collaboration server running on http://localhost:${PORT}`);
// });



import 'dotenv/config';
import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import { Server as SocketIOServer } from 'socket.io';
import { createRequire } from 'module';
import * as Y from 'yjs';

const require = createRequire(import.meta.url);
const { setupWSConnection, setPersistence, docs } = require('y-websocket/bin/utils');

import redis from './config/redis.js';
import File from './models/File.js';
import connectDB from './config/db.js';

connectDB();

// ✅ CHANGE 1 — PORT: Azure sets PORT automatically
const PORT       = process.env.COLLAB_PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL;
const MAX_USERS  = 5;
const ROOM_TTL   = 7200;
const AUTOCLOSE_MS = 2 * 60 * 60 * 1000;
const DEBOUNCE_MS  = 2000;

const app = express();
app.use(express.json());
app.get('/health', (_, res) =>
  res.json({ status: 'ok', service: 'collaboration', timestamp: new Date().toISOString() })
);

const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

const roomFileMap = new Map();
const saveTimers = new Map();
const autoCloseTimers = new Map();

// ─── everything below unchanged until upgrade handler ───────────────────────

setPersistence({
  bindState: async (docName, ydoc) => {
    let fileId = roomFileMap.get(docName);
    if (!fileId) {
      try {
        const metaRaw = await redis.get(`room:${docName}:meta`);
        if (metaRaw) {
          const meta = JSON.parse(metaRaw);
          if (meta.fileId) {
            fileId = meta.fileId;
            roomFileMap.set(docName, fileId);
          }
        }
      } catch (e) { /* ignore */ }
    }
    if (fileId) {
      try {
        const file = await File.findById(fileId).select('code');
        if (file && ydoc.getText('monaco').length === 0 && file.code) {
          ydoc.transact(() => {
            ydoc.getText('monaco').insert(0, file.code);
          });
        }
      } catch (err) {
        console.error(`[yjs] bindState load failed for room ${docName}:`, err.message);
      }
    }

    const onUpdate = () => scheduleSave(docName, ydoc);
    ydoc.on('update', onUpdate);
    ydoc._collabOnUpdate = onUpdate;

    armAutoClose(docName);
  },
  writeState: async (docName, ydoc) => {
    if (ydoc._collabOnUpdate) ydoc.off('update', ydoc._collabOnUpdate);
    const t = saveTimers.get(docName);
    if (t) clearTimeout(t);
    saveTimers.delete(docName);
    await flushSave(docName, ydoc);
  },
});

function scheduleSave(docName, ydoc) {
  const existing = saveTimers.get(docName);
  if (existing) clearTimeout(existing);
  const t = setTimeout(() => {
    saveTimers.delete(docName);
    flushSave(docName, ydoc).catch((err) =>
      console.error(`[yjs] save error room ${docName}:`, err.message)
    );
  }, DEBOUNCE_MS);
  saveTimers.set(docName, t);
}

async function flushSave(docName, ydoc) {
  const fileId = roomFileMap.get(docName);
  if (!fileId) return;
  const code = ydoc.getText('monaco').toString();
  try {
    await File.findByIdAndUpdate(fileId, { code, updatedAt: new Date() });
    console.log(`[yjs] saved room ${docName} → file ${fileId} (${code.length} chars)`);
  } catch (err) {
    console.error(`[yjs] mongo save failed room ${docName}:`, err.message);
  }
}

function armAutoClose(docName) {
  if (autoCloseTimers.has(docName)) return;
  const t = setTimeout(async () => {
    autoCloseTimers.delete(docName);
    console.log(`[autoclose] room ${docName} hit 2h limit — closing`);
    io.to(docName).emit('room-closed', { message: 'Session auto-ended after 2 hours.' });
    await teardownRoom(docName);
  }, AUTOCLOSE_MS);
  autoCloseTimers.set(docName, t);
}

async function teardownRoom(roomId) {
  const ydoc = docs.get(roomId);
  if (ydoc) {
    const t = saveTimers.get(roomId);
    if (t) clearTimeout(t);
    saveTimers.delete(roomId);
    try { await flushSave(roomId, ydoc); } catch {}
    ydoc.destroy();
    docs.delete(roomId);
  }
  const at = autoCloseTimers.get(roomId);
  if (at) clearTimeout(at);
  autoCloseTimers.delete(roomId);
  roomFileMap.delete(roomId);
  await cleanupRoom(roomId);

  const socketsInRoom = await io.in(roomId).fetchSockets();
  socketsInRoom.forEach((s) => s.leave(roomId));
}

// ────────────────────────────────────────────────────────────────────────────
//  WebSocket upgrade
// ────────────────────────────────────────────────────────────────────────────
wss.on('connection', (conn, req) => setupWSConnection(conn, req));

server.on('upgrade', (request, socket, head) => {
  // ✅ CHANGE 2 — use actual host instead of hardcoded localhost
  const host = request.headers.host || 'localhost';
  const url = new URL(request.url, `http://${host}`);

  if (url.pathname.startsWith('/yjs/')) {
    const roomId = url.pathname.slice('/yjs/'.length);
    request.url = '/' + roomId + url.search;
    wss.handleUpgrade(request, socket, head, (ws) => wss.emit('connection', ws, request));
  } else if (url.pathname === '/yjs' || url.pathname === '/yjs/') {
    socket.destroy();
  }
});

// ────────────────────────────────────────────────────────────────────────────
//  Socket.IO
// ────────────────────────────────────────────────────────────────────────────
const io = new SocketIOServer(server, {
  cors: { 
    origin: CLIENT_URL, 
    methods: ['GET', 'POST'], 
    credentials: true 
  },
  // ✅ CHANGE 3 — add transports for Azure App Service compatibility
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

const rKeys = {
  users:    (r) => `room:${r}:users`,
  lang:     (r) => `room:${r}:lang`,
  host:     (r) => `room:${r}:host`,
  hostUser: (r) => `room:${r}:hostUserId`,
  meta:     (r) => `room:${r}:meta`,
};

const refreshTTL = async (roomId) => {
  await Promise.all(Object.values(rKeys).map((fn) => redis.expire(fn(roomId), ROOM_TTL)));
};

const getUsersList = async (roomId, hostSocketId) => {
  const raw = await redis.hgetall(rKeys.users(roomId));
  if (!raw) return [];
  return Object.entries(raw)
    .map(([socketId, username]) => ({ socketId, username, isHost: socketId === hostSocketId }))
    .sort((a, b) => a.socketId.localeCompare(b.socketId));
};

const broadcastUsers = async (roomId) => {
  const hostSocketId = await redis.get(rKeys.host(roomId));
  const users        = await getUsersList(roomId, hostSocketId);
  io.to(roomId).emit('users-update', { users });
  return users;
};

const cleanupRoom = async (roomId) => {
  await Promise.all(Object.values(rKeys).map((fn) => redis.del(fn(roomId))));
};

const removeUserFromRoom = async (roomId, socketId) => {
  if (!roomId) return;
  await redis.hdel(rKeys.users(roomId), socketId);
  const remaining = await redis.hlen(rKeys.users(roomId));
  if (remaining === 0) {
    await cleanupRoom(roomId);
    io.to(roomId).emit('users-update', { users: [] });
    return;
  }
  await broadcastUsers(roomId);
};

io.on('connection', (socket) => {
  console.log('connected:', socket.id);

  socket.on('join-room', async ({
    roomId, username, userId,
    createIfMissing, language,
    fileName, fileId,
  }) => {
    if (!roomId || !username) return;

    const roomExists = await redis.exists(rKeys.lang(roomId));

    if (!roomExists) {
      if (!createIfMissing) {
        socket.emit('room-not-found');
        return;
      }
      await redis.set(rKeys.lang(roomId),     language || 'cpp');
      await redis.set(rKeys.host(roomId),     socket.id);
      await redis.set(rKeys.hostUser(roomId), userId || '');
      await redis.set(rKeys.meta(roomId), JSON.stringify({
        fileName: fileName || 'Untitled',
        fileId:   fileId   || null,
      }));
      await refreshTTL(roomId);
      if (fileId) roomFileMap.set(roomId, fileId);
      console.log(`Room ${roomId} created by ${username}, fileId: ${fileId}`);
    }

    const userCount = await redis.hlen(rKeys.users(roomId));
    if (userCount >= MAX_USERS) {
      socket.emit('room-full');
      return;
    }

    await redis.hset(rKeys.users(roomId), socket.id, username);
    socket.join(roomId);
    socket.data.roomId   = roomId;
    socket.data.username = username;
    await refreshTTL(roomId);

    const hostSocketId    = await redis.get(rKeys.host(roomId));
    const currentLanguage = await redis.get(rKeys.lang(roomId));
    const metaRaw         = await redis.get(rKeys.meta(roomId));
    const meta            = metaRaw ? JSON.parse(metaRaw) : {};
    const users           = await getUsersList(roomId, hostSocketId);
    const isHost          = socket.id === hostSocketId;

    socket.emit('room-joined', {
      roomId,
      users,
      language:  currentLanguage,
      isHost,
      fileName:  meta.fileName || 'Untitled',
    });

    io.to(roomId).emit('users-update', { users });
  });

  socket.on('close-room', async ({ roomId }) => {
    if (!roomId) return;
    const hostSocketId = await redis.get(rKeys.host(roomId));
    if (socket.id !== hostSocketId) return;

    console.log(`Room ${roomId} closed by host`);
    io.to(roomId).emit('room-closed', { message: 'Host ended the session.' });
    await teardownRoom(roomId);
  });

  socket.on('leave-room', async ({ roomId }) => {
    const target = roomId || socket.data.roomId;
    if (!target) return;
    await removeUserFromRoom(target, socket.id);
    socket.leave(target);
  });

  socket.on('language-change', async ({ roomId, language }) => {
    if (!roomId || !language) return;
    await redis.set(rKeys.lang(roomId), language);
    socket.to(roomId).emit('language-change', { language });
  });

  socket.on('disconnecting', async () => {
    const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
    await Promise.all(rooms.map((r) => removeUserFromRoom(r, socket.id)));
  });

  socket.on('disconnect', () => console.log('disconnected:', socket.id));
});

server.listen(PORT, () => {
  console.log(`Collaboration server running on http://localhost:${PORT}`);
});