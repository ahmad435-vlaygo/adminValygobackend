import express from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getAllSubscriptions,
  getSubscriptionStats,
  updateSubscriptionStatus,
} from '../controllers/subscriptionController';

const router = express.Router();

router.get('/', authMiddleware, getAllSubscriptions);
router.get('/stats', authMiddleware, getSubscriptionStats);
router.put('/:id/status', authMiddleware, updateSubscriptionStatus);

export default router;
