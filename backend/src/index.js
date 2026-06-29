import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import passport from 'passport';
import authRouter from './routes/auth.js';
import executeRouter from "./routes/execute.js";
import filesRouter from "./routes/filesRoutes.js";

const app = express();

// ✅ Fix PORT — fallback to 3000 locally
const PORT = process.env.PORT || 3000;

const CLIENT_URL = process.env.CLIENT_URL;

app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '1mb' }));
app.use(passport.initialize());

await connectDB();

app.use('/api/v1/auth', authRouter); 
app.use('/api/v1/code', executeRouter);
app.use('/api/v1/files', filesRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});