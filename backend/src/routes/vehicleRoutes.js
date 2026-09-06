import {Router} from 'express';
import {protect} from '../middleware/auth.js';
import {authorize} from '../middleware/authorize.js';
import {createVehicle, deleteVehicle, getVehicle, listVehicles, updateVehicle} from '../controllers/vehicleController.js';

const router = Router();
router.use(protect);
router.get('/', authorize('ADMIN', 'DEALER'), listVehicles);
router.get('/:id', authorize('ADMIN', 'DEALER'), getVehicle);
router.post('/', authorize('ADMIN', 'DEALER'), createVehicle);
router.put('/:id', authorize('ADMIN', 'DEALER'), updateVehicle);
router.delete('/:id', authorize('ADMIN', 'DEALER'), deleteVehicle);
export default router;
