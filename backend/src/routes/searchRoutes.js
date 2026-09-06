import {Router} from 'express';
import {protect} from '../middleware/auth.js';
import {authorize} from '../middleware/authorize.js';
import {searchVehicle} from '../controllers/searchController.js';

const router = Router();
router.get('/', protect, authorize('ADMIN', 'AGENT'), searchVehicle);
export default router;
