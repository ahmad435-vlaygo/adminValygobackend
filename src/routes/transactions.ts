import express from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getAllTransactions,
  getTransactionStats,
  getTransactionById,
} from '../controllers/transactionController';

const router = express.Router();

router.get('/', authMiddleware, getAllTransactions);
router.get('/stats', authMiddleware, getTransactionStats);
router.get('/:id', authMiddleware, getTransactionById);

export default router;
