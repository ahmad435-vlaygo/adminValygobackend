import express from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getAllKycRequests,
  getKycById,
  approveKyc,
  rejectKyc,
  getKycStats,
  getKycStatusFromUsers,
} from '../controllers/kycController';

const router = express.Router();

router.get('/status', authMiddleware, getKycStatusFromUsers);
router.get('/', authMiddleware, getAllKycRequests);
router.get('/stats', authMiddleware, getKycStats);
router.get('/:id', authMiddleware, getKycById);
router.put('/:id/approve', authMiddleware, approveKyc);
router.put('/:id/reject', authMiddleware, rejectKyc);

export default router;
