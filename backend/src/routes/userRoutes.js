import {Router} from 'express';
import {protect} from '../middleware/auth.js';
import {authorize} from '../middleware/authorize.js';
import {createUser, listUsers, resetPassword, setUserStatus} from '../controllers/userController.js';

const router = Router();
router.use(protect, authorize('ADMIN'));
router.get('/', listUsers);
router.post('/', createUser);
router.patch('/:id/status', setUserStatus);
router.patch('/:id/password', resetPassword);
export default router;
