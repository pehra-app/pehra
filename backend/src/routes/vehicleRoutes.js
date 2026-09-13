import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import {
  createVehicle,
  deleteVehicle,
  findCustomerMatches,
  getVehicle,
  listVehicles,
  listWantedCustomers,
  updateVehicle,
} from '../controllers/vehicleController.js';

const router = Router();
router.use(protect);
router.get('/', authorize('ADMIN', 'DEALER', 'AGENT'), listVehicles);
router.get('/wanted-customers', authorize('DEALER'), listWantedCustomers);
router.get(
  '/customer-match',
  authorize('ADMIN', 'DEALER'),
  findCustomerMatches,
);
router.get('/:id', authorize('ADMIN', 'DEALER', 'AGENT'), getVehicle);
router.post('/', authorize('ADMIN', 'DEALER'), createVehicle);
router.put('/:id', authorize('ADMIN', 'DEALER'), updateVehicle);
router.delete('/:id', authorize('ADMIN', 'DEALER'), deleteVehicle);
export default router;
