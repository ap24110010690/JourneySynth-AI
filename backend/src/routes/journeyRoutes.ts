// backend/src/routes/journeyRoutes.ts
import { Router } from 'express';
import { JourneyController } from '../controllers/journeyController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', JourneyController.getEvents);
router.get('/customers/:datasetId', JourneyController.getCustomers);
router.get('/:customerId', JourneyController.getCustomerDetails);
router.get('/:customerId/timeline', JourneyController.getCustomerTimeline);

export default router;
