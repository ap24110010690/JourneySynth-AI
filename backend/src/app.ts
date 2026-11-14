// backend/src/app.ts
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import datasetRoutes from './routes/datasetRoutes.js';
import journeyRoutes from './routes/journeyRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import exportRoutes from './routes/exportRoutes.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';

export function createExpressApp() {
  const app = express();

  // Basic security and parsing middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      app: 'JourneySynth AI',
      timestamp: new Date().toISOString(),
    });
  });

  // REST API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/datasets', datasetRoutes);
  app.use('/api/generate', datasetRoutes); // Support both /api/generate and /api/datasets/generate
  app.use('/api/dashboard', datasetRoutes); // Handles /api/dashboard/stats
  app.use('/api/journeys', journeyRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/export', exportRoutes);

  // Error handling middleware
  app.use(errorMiddleware);

  return app;
}
