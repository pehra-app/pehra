import {Router} from 'express';
import {protect} from '../middleware/auth.js';
import {saveDeviceToken} from '../controllers/deviceController.js';

const router = Router();
router.put('/token', protect, saveDeviceToken);
export default router;
