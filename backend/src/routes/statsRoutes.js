import {Router} from 'express';
import {protect} from '../middleware/auth.js';
import {authorize} from '../middleware/authorize.js';
import {adminStats, dealerStats} from '../controllers/statsController.js';

const router = Router();
router.get('/admin/stats', protect, authorize('ADMIN'), adminStats);
router.get('/dealer/stats', protect, authorize('DEALER'), dealerStats);
export default router;
