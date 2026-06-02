import 'dotenv/config';
import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import { Server as SocketIOServer } from 'socket.io';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { setupWSConnection } = require('y-websocket/bin/utils');
import redis from './config/redis.js';

const PORT = 3001;
const CLIENT_URL = 'http://localhost:5173';
const MAX_USERS_PER_ROOM = 5;

const app = express();

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'collaboration', timestamp: new Date().toISOString() });
});

const server = http.createServer(app);

// ✅ Step 1 — wss in noServer mode
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (conn, req) => {
  console.log('Yjs WS connection established');
  setupWSConnection(conn, req);
});

// ✅ Step 2 — upgrade handler BEFORE Socket.IO
server.on('upgrade', (request, socket, head) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  console.log('UPGRADE REQUEST PATH:', pathname);

  if (pathname.startsWith('/yjs')) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
  // Socket.IO handles everything else automatically
});

// ✅ Step 3 — Socket.IO AFTER upgrade handler
const io = new SocketIOServer(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const roomUsersKey = (roomId) => `room:${roomId}:users`;
const roomLangKey = (roomId) => `room:${roomId}:lang`;

const getUsersList = async (roomId) => {
  const raw = await redis.hgetall(roomUsersKey(roomId));
  if (!raw) return [];
  return Object.entries(raw)
    .map(([socketId, username]) => ({ socketId, username }))
    .sort((a, b) => a.socketId.localeCompare(b.socketId));
};

const broadcastUsers = async (roomId) => {
  const users = await getUsersList(roomId);
  io.to(roomId).emit('users-update', { users });
  return users;
};

const removeUserFromRoom = async (roomId, socketId) => {
  if (!roomId) return;
  await redis.hdel(roomUsersKey(roomId), socketId);
  const remaining = await redis.hlen(roomUsersKey(roomId));

  if (remaining === 0) {
    await redis.del(roomUsersKey(roomId));
    await redis.del(roomLangKey(roomId));
    io.to(roomId).emit('users-update', { users: [] });
    return;
  }

  await broadcastUsers(roomId);
};

io.on('connection', (socket) => {
  console.log('Socket.IO client connected:', socket.id);

  socket.on('join-room', async ({ roomId, username, createIfMissing, language }) => {
    if (!roomId || !username) return;

    const langKey = roomLangKey(roomId);
    const usersKey = roomUsersKey(roomId);

    const roomExists = await redis.exists(langKey);

    if (!roomExists) {
      if (!createIfMissing) {
        socket.emit('room-not-found');
        return;
      }
      await redis.set(langKey, language || 'javascript');
    }

    const userCount = await redis.hlen(usersKey);
    if (userCount >= MAX_USERS_PER_ROOM) {
      socket.emit('room-full');
      return;
    }

    await redis.hset(usersKey, socket.id, username);
    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.username = username;

    const currentLanguage = await redis.get(langKey);
    const users = await getUsersList(roomId);

    console.log(`User ${username} joined room ${roomId}, total users: ${users.length}`);

    socket.emit('room-joined', { roomId, users, language: currentLanguage });
    io.to(roomId).emit('users-update', { users });
  });

  socket.on('leave-room', async ({ roomId }) => {
    const targetRoom = roomId || socket.data.roomId;
    if (!targetRoom) return;
    await removeUserFromRoom(targetRoom, socket.id);
    socket.leave(targetRoom);
  });

  socket.on('language-change', async ({ roomId, language }) => {
    if (!roomId || !language) return;
    await redis.set(roomLangKey(roomId), language);
    socket.to(roomId).emit('language-change', { language });
  });

  socket.on('disconnecting', async () => {
    const rooms = Array.from(socket.rooms).filter((room) => room !== socket.id);
    await Promise.all(rooms.map((roomId) => removeUserFromRoom(roomId, socket.id)));
  });

  socket.on('disconnect', () => {
    console.log('Socket.IO client disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Collaboration server running on http://localhost:${PORT}`);
});