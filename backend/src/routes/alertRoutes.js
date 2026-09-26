import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import {
  deleteAlert,
  listAlerts,
  markAlertRead,
  markAllAlertsRead,
} from '../controllers/alertController.js';

const router = Router();
router.get('/', protect, authorize('ADMIN', 'DEALER'), listAlerts);
router.patch(
  '/read-all',
  protect,
  authorize('ADMIN', 'DEALER'),
  markAllAlertsRead,
);
router.patch('/:id/read', protect, authorize('ADMIN', 'DEALER'), markAlertRead);
router.delete('/:id', protect, authorize('ADMIN', 'DEALER'), deleteAlert);
export default router;
