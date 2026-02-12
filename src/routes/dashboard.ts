import { Router } from 'express';
import { 
  getDashboardStats,
  getOverviewStats,
  getChartData,
  getUsersStats,
  getSubscriptionStats,
  getTransactionStats
} from '../controllers/dashboardController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/stats', authMiddleware, getDashboardStats);
router.get('/overview-stats', authMiddleware, getOverviewStats);
router.get('/chart-data', authMiddleware, getChartData);
router.get('/users-stats', authMiddleware, getUsersStats);
router.get('/subscription-stats', authMiddleware, getSubscriptionStats);
router.get('/transaction-stats', authMiddleware, getTransactionStats);

export default router;
