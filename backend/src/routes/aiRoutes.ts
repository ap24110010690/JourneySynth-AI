// backend/src/routes/aiRoutes.ts
import { Router } from 'express';
import { AiController } from '../controllers/aiController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/analyze/:datasetId', AiController.analyzeDataset);
router.post('/persona/:customerId', AiController.generatePersona);
router.post('/question/:datasetId', AiController.askQuestion);

export default router;
