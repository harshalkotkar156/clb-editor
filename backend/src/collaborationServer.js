import 'dotenv/config';
import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import { Server as SocketIOServer } from 'socket.io';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { setupWSConnection } = require('y-websocket/bin/utils');
import redis from './config/redis.js';
import File from './models/File.js';

const PORT     = 3001;
const CLIENT_URL = 'http://localhost:5173';
const MAX_USERS  = 5;
const ROOM_TTL   = 7200;

const app = express();
app.use(express.json());

app.get('/health', (_, res) =>
  res.json({ status: 'ok', service: 'collaboration', timestamp: new Date().toISOString() })
);

const server = http.createServer(app);

const wss = new WebSocketServer({ noServer: true });
wss.on('connection', (conn, req) => setupWSConnection(conn, req));

server.on('upgrade', (request, socket, head) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  if (pathname.startsWith('/yjs')) {
    wss.handleUpgrade(request, socket, head, (ws) => wss.emit('connection', ws, request));
  }
});

const io = new SocketIOServer(server, {
  cors: { origin: CLIENT_URL, methods: ['GET', 'POST'], credentials: true },
});

// ── Redis keys ────────────────────────────────────────────────────────────────
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

// ── Socket.IO events ──────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('connected:', socket.id);

  socket.on('join-room', async ({
    roomId, username, userId,
    createIfMissing, language,
    fileName, fileId, code,
  }) => {
    // ✅ validate required fields
    if (!roomId || !username) {
      console.warn('join-room missing roomId or username', { roomId, username });
      return;
    }

    const roomExists = await redis.exists(rKeys.lang(roomId));

    if (!roomExists) {
      if (!createIfMissing) {
        socket.emit('room-not-found');
        return;
      }

      // CREATE ROOM
      await redis.set(rKeys.lang(roomId),     language || 'cpp');
      await redis.set(rKeys.host(roomId),     socket.id);
      await redis.set(rKeys.hostUser(roomId), userId || '');
      await redis.set(rKeys.meta(roomId), JSON.stringify({
        fileName: fileName || 'Untitled',
        fileId:   fileId   || null,
      }));
      await refreshTTL(roomId);
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

    // ✅ fetch latest code from MongoDB for joiners
    let roomCode = '';
    let roomFileName = meta.fileName || 'Untitled';
    if (meta.fileId) {
      try {
        const file = await File.findById(meta.fileId).select('code name');
        if (file) {
          roomCode     = file.code || '';
          roomFileName = file.name || roomFileName;
        }
      } catch (err) {
        console.error('Failed to fetch file for room:', err.message);
      }
    }

    socket.emit('room-joined', {
      roomId,
      users,
      language:  currentLanguage,
      isHost,
      fileName:  roomFileName,
      code:      isHost ? '' : roomCode, // host already has code in editor
    });

    io.to(roomId).emit('users-update', { users });
  });

  // ── sync-code: host saves latest code to MongoDB ───────────────────────────
  socket.on('sync-code', async ({ roomId, code }) => {
    if (!roomId || code === undefined) return;

    const hostSocketId = await redis.get(rKeys.host(roomId));
    if (socket.id !== hostSocketId) return; // only host can sync

    const metaRaw = await redis.get(rKeys.meta(roomId));
    if (!metaRaw) return;
    const meta = JSON.parse(metaRaw);
    if (!meta.fileId) return;

    try {
      await File.findByIdAndUpdate(meta.fileId, { code, updatedAt: new Date() });
      console.log(`Code synced for room ${roomId}, file ${meta.fileId}`);
    } catch (err) {
      console.error('sync-code error:', err.message);
    }
  });

  // ── close-room ─────────────────────────────────────────────────────────────
  socket.on('close-room', async ({ roomId }) => {
    if (!roomId) return;
    const hostSocketId = await redis.get(rKeys.host(roomId));
    if (socket.id !== hostSocketId) return;

    // save final code to MongoDB before closing
    try {
      const metaRaw = await redis.get(rKeys.meta(roomId));
      if (metaRaw) {
        const meta = JSON.parse(metaRaw);
        // code sync happens via sync-code — no need to save here
        // just cleanup
      }
    } catch {}

    console.log(`Room ${roomId} closed by host`);
    io.to(roomId).emit('room-closed', { message: 'Host ended the session.' });
    await cleanupRoom(roomId);

    const socketsInRoom = await io.in(roomId).fetchSockets();
    socketsInRoom.forEach((s) => s.leave(roomId));
  });

  // ── leave-room ─────────────────────────────────────────────────────────────
  socket.on('leave-room', async ({ roomId }) => {
    const target = roomId || socket.data.roomId;
    if (!target) return;
    await removeUserFromRoom(target, socket.id);
    socket.leave(target);
  });

  // ── language-change ────────────────────────────────────────────────────────
  socket.on('language-change', async ({ roomId, language }) => {
    if (!roomId || !language) return;
    await redis.set(rKeys.lang(roomId), language);
    socket.to(roomId).emit('language-change', { language });
  });

  // ── disconnecting ──────────────────────────────────────────────────────────
  socket.on('disconnecting', async () => {
    const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
    await Promise.all(rooms.map((r) => removeUserFromRoom(r, socket.id)));
  });

  socket.on('disconnect', () => console.log('disconnected:', socket.id));
});

server.listen(PORT, () => {
  console.log(`Collaboration server running on http://localhost:${PORT}`);
});