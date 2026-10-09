import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import studentRoutes from './routes/student.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();
const PORT = Number(process.env.PORT || 5000);
const configuredOrigins = (process.env.FRONTEND_ORIGIN || process.env.FRONTEND_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  ...configuredOrigins,
]);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.get('/health', (req, res) => res.json({
  success: true,
  message: 'CAMPUS IQ API is running',
  time: new Date().toISOString(),
}));

app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use((error, req, res, next) => {
  console.error('Request error:', error.message);
  if (res.headersSent) return next(error);
  res.status(error.message.startsWith('CORS blocked') ? 403 : 500).json({
    success: false,
    message: error.message.startsWith('CORS blocked') ? 'Request origin is not allowed' : 'Internal server error',
  });
});

async function startServer() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters');
  }
  await connectDB();
  app.listen(PORT, () => console.info(`CAMPUS IQ API listening on port ${PORT}`));
}

startServer().catch((error) => {
  console.error('Failed to start CAMPUS IQ API:', error.message);
  process.exitCode = 1;
});
