import express from 'express';
import { createMaintenanceRequest, updateMaintenanceStatus } from '../controllers/maintenanceController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createMaintenanceRequest);

router.route('/:id/status')
  .patch(protect, authorizeRoles('Admin', 'Asset Manager'), updateMaintenanceStatus);

export default router;