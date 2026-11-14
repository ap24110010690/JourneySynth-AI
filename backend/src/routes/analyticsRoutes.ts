// backend/src/routes/analyticsRoutes.ts
import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/:datasetId', AnalyticsController.getAnalytics);

export default router;
