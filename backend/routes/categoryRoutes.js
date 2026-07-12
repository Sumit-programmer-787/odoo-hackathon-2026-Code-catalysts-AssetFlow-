import express from 'express';
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getCategories)
  .post(protect, authorizeRoles('Admin', 'Asset Manager'), createCategory);

router.route('/:id')
  .patch(protect, authorizeRoles('Admin', 'Asset Manager'), updateCategory)
  .delete(protect, authorizeRoles('Admin', 'Asset Manager'), deleteCategory);

export default router;