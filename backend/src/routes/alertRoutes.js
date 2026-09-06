import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { deleteAlert, listAlerts } from '../controllers/alertController.js';

const router = Router();
router.get('/', protect, authorize('ADMIN', 'DEALER'), listAlerts);
router.delete('/:id', protect, authorize('ADMIN', 'DEALER'), deleteAlert);
export default router;
