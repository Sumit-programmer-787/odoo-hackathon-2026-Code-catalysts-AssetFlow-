import express from 'express';
import {
  createDepartment,
  getDepartments,
  updateDepartment,
  deleteDepartment,
} from '../controllers/departmentController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getDepartments)
  .post(protect, authorizeRoles('Admin'), createDepartment);

router.route('/:id')
  .patch(protect, authorizeRoles('Admin'), updateDepartment)
  .delete(protect, authorizeRoles('Admin'), deleteDepartment);

export default router;