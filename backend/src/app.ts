import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { ENV } from './config/env.js';

const app = express();

// Security Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration - Permissive for dev to eliminate all network/origin errors
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Rate Limiting - Optimized for local development and real-time classroom polling
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50000, // High ceiling to prevent throttling active classroom attendance polling
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting on local dev connections
    const host = req.headers.host || '';
    return host.includes('localhost') || host.includes('127.0.0.1');
  },
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// JSON and URL-encoded parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve local static uploaded media files
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

// Mount API Routes (Both /api and / to support all serverless reverse proxy environments)
app.use('/api', apiRoutes);
app.use('/', apiRoutes);

// Catch-all 404 for API
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`,
  });
});

// Centralized Error Handler
app.use(errorHandler);

export default app;
