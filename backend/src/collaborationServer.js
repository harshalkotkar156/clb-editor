// import 'dotenv/config';
// import express from 'express';
// import http from 'http';
// import { WebSocketServer } from 'ws';
// import { Server as SocketIOServer } from 'socket.io';
// import { createRequire } from 'module';
// const require = createRequire(import.meta.url);
// const { setupWSConnection } = require('y-websocket/bin/utils');
// import redis from './config/redis.js';

// const PORT = 3001;
// const CLIENT_URL = 'http://localhost:5173';
// const MAX_USERS_PER_ROOM = 5;

// const app = express();

// app.get('/health', (req, res) => {
//   res.json({ status: 'ok', service: 'collaboration', timestamp: new Date().toISOString() });
// });

// const server = http.createServer(app);

// // ✅ Step 1 — wss in noServer mode
// const wss = new WebSocketServer({ noServer: true });

// wss.on('connection', (conn, req) => {
//   console.log('Yjs WS connection established');
//   setupWSConnection(conn, req);
// });

// // ✅ Step 2 — upgrade handler BEFORE Socket.IO
// server.on('upgrade', (request, socket, head) => {
//   const pathname = new URL(request.url, 'http://localhost').pathname;
//   console.log('UPGRADE REQUEST PATH:', pathname);

//   if (pathname.startsWith('/yjs')) {
//     wss.handleUpgrade(request, socket, head, (ws) => {
//       wss.emit('connection', ws, request);
//     });
//   }
//   // Socket.IO handles everything else automatically
// });

// // ✅ Step 3 — Socket.IO AFTER upgrade handler
// const io = new SocketIOServer(server, {
//   cors: {
//     origin: CLIENT_URL,
//     methods: ['GET', 'POST'],
//     credentials: true,
//   },
// });

// const roomUsersKey = (roomId) => `room:${roomId}:users`;
// const roomLangKey = (roomId) => `room:${roomId}:lang`;

// const getUsersList = async (roomId) => {
//   const raw = await redis.hgetall(roomUsersKey(roomId));
//   if (!raw) return [];
//   return Object.entries(raw)
//     .map(([socketId, username]) => ({ socketId, username }))
//     .sort((a, b) => a.socketId.localeCompare(b.socketId));
// };

// const broadcastUsers = async (roomId) => {
//   const users = await getUsersList(roomId);
//   io.to(roomId).emit('users-update', { users });
//   return users;
// };

// const removeUserFromRoom = async (roomId, socketId) => {
//   if (!roomId) return;
//   await redis.hdel(roomUsersKey(roomId), socketId);
//   const remaining = await redis.hlen(roomUsersKey(roomId));

//   if (remaining === 0) {
//     await redis.del(roomUsersKey(roomId));
//     await redis.del(roomLangKey(roomId));
//     io.to(roomId).emit('users-update', { users: [] });
//     return;
//   }

//   await broadcastUsers(roomId);
// };

// io.on('connection', (socket) => {
//   console.log('Socket.IO client connected:', socket.id);

//   socket.on('join-room', async ({ roomId, username, createIfMissing, language }) => {
//     if (!roomId || !username) return;

//     const langKey = roomLangKey(roomId);
//     const usersKey = roomUsersKey(roomId);

//     const roomExists = await redis.exists(langKey);

//     if (!roomExists) {
//       if (!createIfMissing) {
//         socket.emit('room-not-found');
//         return;
//       }
//       await redis.set(langKey, language || 'javascript');
//     }

//     const userCount = await redis.hlen(usersKey);
//     if (userCount >= MAX_USERS_PER_ROOM) {
//       socket.emit('room-full');
//       return;
//     }

//     await redis.hset(usersKey, socket.id, username);
//     socket.join(roomId);
//     socket.data.roomId = roomId;
//     socket.data.username = username;

//     const currentLanguage = await redis.get(langKey);
//     const users = await getUsersList(roomId);

//     console.log(`User ${username} joined room ${roomId}, total users: ${users.length}`);

//     socket.emit('room-joined', { roomId, users, language: currentLanguage });
//     io.to(roomId).emit('users-update', { users });
//   });

//   socket.on('leave-room', async ({ roomId }) => {
//     const targetRoom = roomId || socket.data.roomId;
//     if (!targetRoom) return;
//     await removeUserFromRoom(targetRoom, socket.id);
//     socket.leave(targetRoom);
//   });

//   socket.on('language-change', async ({ roomId, language }) => {
//     if (!roomId || !language) return;
//     await redis.set(roomLangKey(roomId), language);
//     socket.to(roomId).emit('language-change', { language });
//   });

//   socket.on('disconnecting', async () => {
//     const rooms = Array.from(socket.rooms).filter((room) => room !== socket.id);
//     await Promise.all(rooms.map((roomId) => removeUserFromRoom(roomId, socket.id)));
//   });

//   socket.on('disconnect', () => {
//     console.log('Socket.IO client disconnected:', socket.id);
//   });
// });

// server.listen(PORT, () => {
//   console.log(`Collaboration server running on http://localhost:${PORT}`);
// });

// from here the new code above code is also working 
import 'dotenv/config';
import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import { Server as SocketIOServer } from 'socket.io';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { setupWSConnection } = require('y-websocket/bin/utils');
import redis from './config/redis.js';

const PORT       = 3001;
const CLIENT_URL = 'http://localhost:5173';
const MAX_USERS  = 5;
const ROOM_TTL   = 7200; // 2 hours in seconds

const app = express();

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'collaboration', timestamp: new Date().toISOString() });
});

const server = http.createServer(app);

// ── Yjs WebSocket ────────────────────────────────────────────────────────────
const wss = new WebSocketServer({ noServer: true });
wss.on('connection', (conn, req) => {
  setupWSConnection(conn, req);
});

server.on('upgrade', (request, socket, head) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  if (pathname.startsWith('/yjs')) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
});

// ── Socket.IO ────────────────────────────────────────────────────────────────
const io = new SocketIOServer(server, {
  cors: {
    origin:  CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// ── Redis key helpers ─────────────────────────────────────────────────────────
const rKeys = {
  users:      (r) => `room:${r}:users`,
  lang:       (r) => `room:${r}:lang`,
  host:       (r) => `room:${r}:host`,
  hostUser:   (r) => `room:${r}:hostUserId`,
  meta:       (r) => `room:${r}:meta`,
};

// refresh TTL on all keys whenever room is active
const refreshTTL = async (roomId) => {
  const keys = Object.values(rKeys).map((fn) => fn(roomId));
  await Promise.all(keys.map((k) => redis.expire(k, ROOM_TTL)));
};

const getUsersList = async (roomId, hostSocketId) => {
  const raw = await redis.hgetall(rKeys.users(roomId));
  if (!raw) return [];
  return Object.entries(raw)
    .map(([socketId, username]) => ({
      socketId,
      username,
      isHost: socketId === hostSocketId,
    }))
    .sort((a, b) => a.socketId.localeCompare(b.socketId));
};

const broadcastUsers = async (roomId) => {
  const hostSocketId = await redis.get(rKeys.host(roomId));
  const users        = await getUsersList(roomId, hostSocketId);
  io.to(roomId).emit('users-update', { users });
  return users;
};

const cleanupRoom = async (roomId) => {
  await Promise.all([
    redis.del(rKeys.users(roomId)),
    redis.del(rKeys.lang(roomId)),
    redis.del(rKeys.host(roomId)),
    redis.del(rKeys.hostUser(roomId)),
    redis.del(rKeys.meta(roomId)),
  ]);
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

// ── Socket.IO events ──────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('connected:', socket.id);

  // ── join-room ───────────────────────────────────────────────────────────────
  socket.on('join-room', async ({
    roomId, username, userId,
    createIfMissing, language,
    fileName, code, // sent by host on room creation
  }) => {
    if (!roomId || !username) return;

    const roomExists = await redis.exists(rKeys.lang(roomId));

    if (!roomExists) {
      if (!createIfMissing) {
        socket.emit('room-not-found');
        return;
      }

      // ── CREATE ROOM ─────────────────────────────────────────────────────────
      // store all room metadata
      await redis.set(rKeys.lang(roomId),     language || 'cpp');
      await redis.set(rKeys.host(roomId),     socket.id);
      await redis.set(rKeys.hostUser(roomId), userId || '');
      await redis.set(rKeys.meta(roomId), JSON.stringify({
        fileName: fileName || 'Untitled',
        code:     code     || '',
        fileId:   null,
      }));

      // set 2-hour TTL on all keys
      await refreshTTL(roomId);
      console.log(`Room ${roomId} created by ${username}`);
    }

    // check user count
    const userCount = await redis.hlen(rKeys.users(roomId));
    if (userCount >= MAX_USERS) {
      socket.emit('room-full');
      return;
    }

    // add user
    await redis.hset(rKeys.users(roomId), socket.id, username);
    socket.join(roomId);
    socket.data.roomId   = roomId;
    socket.data.username = username;

    // refresh TTL whenever someone joins
    await refreshTTL(roomId);

    const hostSocketId    = await redis.get(rKeys.host(roomId));
    const hostUserId      = await redis.get(rKeys.hostUser(roomId));
    const currentLanguage = await redis.get(rKeys.lang(roomId));
    const metaRaw         = await redis.get(rKeys.meta(roomId));
    const meta            = metaRaw ? JSON.parse(metaRaw) : {};
    const users           = await getUsersList(roomId, hostSocketId);
    const isHost          = socket.id === hostSocketId;

    // send room info to the joining user
    socket.emit('room-joined', {
      roomId,
      users,
      language:   currentLanguage,
      isHost,
      fileName:   meta.fileName || 'Untitled',
      code:       meta.code     || '',        // ← initial code for joiners
    });

    io.to(roomId).emit('users-update', { users });
  });

  // ── host updates code snapshot in Redis (called periodically) ───────────────
  // this keeps the code fresh so late joiners get latest snapshot
  socket.on('sync-code', async ({ roomId, code }) => {
    if (!roomId || code === undefined) return;
    const hostSocketId = await redis.get(rKeys.host(roomId));
    if (socket.id !== hostSocketId) return; // only host syncs

    const metaRaw = await redis.get(rKeys.meta(roomId));
    if (!metaRaw) return;
    const meta = JSON.parse(metaRaw);
    meta.code  = code;
    await redis.set(rKeys.meta(roomId), JSON.stringify(meta));
  });

  // ── close-room ──────────────────────────────────────────────────────────────
  socket.on('close-room', async ({ roomId }) => {
    if (!roomId) return;
    const hostSocketId = await redis.get(rKeys.host(roomId));
    if (socket.id !== hostSocketId) return;

    console.log(`Room ${roomId} closed by host`);
    io.to(roomId).emit('room-closed', { message: 'Host ended the session.' });

    await cleanupRoom(roomId);

    const socketsInRoom = await io.in(roomId).fetchSockets();
    socketsInRoom.forEach((s) => s.leave(roomId));
  });

  // ── leave-room ──────────────────────────────────────────────────────────────
  socket.on('leave-room', async ({ roomId }) => {
    const target = roomId || socket.data.roomId;
    if (!target) return;
    await removeUserFromRoom(target, socket.id);
    socket.leave(target);
  });

  // ── language-change (disabled in collab but keeping for safety) ─────────────
  socket.on('language-change', async ({ roomId, language }) => {
    if (!roomId || !language) return;
    await redis.set(rKeys.lang(roomId), language);
    socket.to(roomId).emit('language-change', { language });
  });

  // ── disconnecting ────────────────────────────────────────────────────────────
  socket.on('disconnecting', async () => {
    const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
    await Promise.all(rooms.map((r) => removeUserFromRoom(r, socket.id)));
  });

  socket.on('disconnect', () => {
    console.log('disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Collaboration server running on http://localhost:${PORT}`);
});
