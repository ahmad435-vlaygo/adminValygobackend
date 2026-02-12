import { Router } from 'express';
import {
  createMeeting,
  getMeetings,
  updateMeeting,
  deleteMeeting,
} from '../controllers/meetingController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/', authMiddleware, createMeeting);
router.get('/', authMiddleware, getMeetings);
router.put('/:id', authMiddleware, updateMeeting);
router.delete('/:id', authMiddleware, deleteMeeting);

export default router;
