import dotenv from 'dotenv';
dotenv.config(); // MUST be first

import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import studentRoutes from './routes/student.routes.js';
import mentorRoutes from './routes/mentor.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

/* =======================
   CORS CONFIG (FIXED)
======================= */
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL || 'https://edurisk-monitor-frontend.vercel.app',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow server-to-server & Postman
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

/* =======================
   MIDDLEWARES
======================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger
app.use((req, res, next) => {
  next();
});

/* =======================
   ROUTES
======================= */
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server running',
    time: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/admin', adminRoutes);

/* =======================
   ERROR HANDLING
======================= */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use((err, req, res, next) => {
  console.error(' Error:', err.message);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

/* =======================
   START SERVER
======================= */
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
    });
  } catch (err) {
    console.error(' Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

