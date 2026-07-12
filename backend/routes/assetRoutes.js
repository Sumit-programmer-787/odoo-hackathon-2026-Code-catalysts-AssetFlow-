import express from 'express';
import { 
  createAsset, 
  allocateAsset, 
  requestAssetTransfer, 
  getAssets 
} from '../controllers/assetControllers.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, authorizeRoles('Admin', 'Asset Manager'), createAsset)
  .get(protect, getAssets);

router.patch('/:id/allocate', protect, authorizeRoles('Admin', 'Asset Manager'), allocateAsset);
router.post('/:id/transfer-request', protect, requestAssetTransfer);

export default router;