import express from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getAllUsers,
  getUserById,
  updateUserStatus,
  getUserStats,
} from '../controllers/userController';

const router = express.Router();

router.get('/', authMiddleware, getAllUsers);
router.get('/stats', authMiddleware, getUserStats);
router.get('/:id', authMiddleware, getUserById);
router.put('/:id/status', authMiddleware, updateUserStatus);

export default router;
