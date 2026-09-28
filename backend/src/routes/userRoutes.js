import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import {
  createUser,
  deleteUser,
  listUsers,
  resetPassword,
  setUserStatus,
} from '../controllers/userController.js';

const router = Router();
router.use(protect);
router.get('/', authorize('ADMIN', 'AGENT'), listUsers);
router.use(authorize('ADMIN'));
router.post('/', createUser);
router.patch('/:id/status', setUserStatus);
router.patch('/:id/password', resetPassword);
router.delete('/:id', deleteUser);
export default router;
