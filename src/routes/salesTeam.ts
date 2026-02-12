import { Router } from 'express';
import {
  createSalesTeamUser,
  getSalesTeamUsers,
  updateSalesTeamUser,
  deleteSalesTeamUser,
  getSalesTeamDashboard,
} from '../controllers/salesTeamController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

// Admin routes
router.post('/', authMiddleware, roleMiddleware(['super_admin', 'admin']), createSalesTeamUser);
router.get('/', authMiddleware, roleMiddleware(['super_admin', 'admin']), getSalesTeamUsers);
router.put('/:id', authMiddleware, roleMiddleware(['super_admin', 'admin']), updateSalesTeamUser);
router.delete('/:id', authMiddleware, roleMiddleware(['super_admin', 'admin']), deleteSalesTeamUser);

router.get('/dashboard', authMiddleware, roleMiddleware(['sales_team']), getSalesTeamDashboard);

export default router;
