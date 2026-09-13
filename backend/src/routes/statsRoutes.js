import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import {
  adminStats,
  agentStats,
  dealerStats,
} from '../controllers/statsController.js';

const router = Router();
router.get('/admin/stats', protect, authorize('ADMIN'), adminStats);
router.get('/dealer/stats', protect, authorize('DEALER'), dealerStats);
router.get('/agent/stats', protect, authorize('AGENT'), agentStats);
export default router;
