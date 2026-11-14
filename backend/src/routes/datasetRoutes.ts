// backend/src/routes/datasetRoutes.ts
import { Router } from 'express';
import { DatasetController } from '../controllers/datasetController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/generate', DatasetController.generate);
router.get('/', DatasetController.getAll);
router.get('/dashboard/stats', DatasetController.getDashboardStats);
router.get('/:id', DatasetController.getById);
router.delete('/:id', DatasetController.delete);

export default router;
