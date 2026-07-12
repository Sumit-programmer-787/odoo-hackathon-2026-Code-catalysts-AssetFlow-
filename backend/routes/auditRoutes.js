import express from 'express';
import { initiateAudit, updateAuditItem, closeAudit } from '../controllers/auditController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, authorizeRoles('Admin', 'Asset Manager'));

router.route('/').post(initiateAudit);
router.patch('/:id/reconcile', updateAuditItem);
router.patch('/:id/close', closeAudit);

export default router;