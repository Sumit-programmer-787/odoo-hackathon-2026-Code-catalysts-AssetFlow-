import express from 'express';
import {
  registerUser,
  loginUser,
  updateUserRole,
  getAllUsers,
} from '../controllers/authController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public open-access routes
router.post('/signup', registerUser);
router.post('/login', loginUser);

// Restricted Directory Access: Staff with higher ranks can read the system phone-book directory
router.get(
  '/users',
  protect,
  authorizeRoles('Admin', 'Asset Manager', 'Department Head'),
  getAllUsers
);

// Strict Promotion Vector: Rule 1 dictates Admin access parameter to alter base profile authorizations
router.patch(
  '/promote/:id',
  protect,
  authorizeRoles('Admin'),
  updateUserRole
);

export default router;