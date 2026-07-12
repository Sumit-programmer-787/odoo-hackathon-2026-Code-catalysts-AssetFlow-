import Asset from '../models/Asset.js';

/**
 * @desc    Create a new trackable asset
 * @route   POST /api/assets
 * @access  Private (Admin / Asset Manager)
 */
export const createAsset = async (req, res, next) => {
  try {
    const { assetTag, name, category, status, assignedDepartment, location3D, metadata } = req.body;

    const assetExists = await Asset.findOne({ assetTag });
    if (assetExists) {
      res.status(400);
      throw new Error(`Asset with tag ${assetTag} already exists.`);
    }

    const asset = await Asset.create({
      assetTag,
      name,
      category,
      status: status || 'Available',
      assignedDepartment,
      location3D,
      metadata,
    });

    res.status(201).json(asset);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Allocate an asset to an employee (Enforces Rule 2: Conflict Handling)
 * @route   PATCH /api/assets/:id/allocate
 * @access  Private (Admin / Asset Manager)
 */
export const allocateAsset = async (req, res, next) => {
  try {
    const { targetUserId } = req.body;
    const asset = await Asset.findById(req.params.id).populate('currentHolder', 'name email');

    if (!asset) {
      res.status(404);
      throw new Error('Target asset not found.');
    }

    // Rule 2: Double-allocation check
    if (asset.status === 'Allocated' && asset.currentHolder) {
      res.status(409); // Conflict status code
      return res.json({
        conflict: true,
        message: `Allocation Blocked: This asset is currently held by ${asset.currentHolder.name} (${asset.currentHolder.email}).`,
        transferHook: `/api/assets/${asset._id}/transfer-request`,
        currentHolderId: asset.currentHolder._id,
      });
    }

    asset.status = 'Allocated';
    asset.currentHolder = targetUserId;
    const updatedAsset = await asset.save();

    res.status(200).json(updatedAsset);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Initiate a transfer request hook for a contested asset
 * @route   POST /api/assets/:id/transfer-request
 * @access  Private (All Authenticated Users)
 */
export const requestAssetTransfer = async (req, res, next) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      res.status(404);
      throw new Error('Asset not found.');
    }

    // In a full ERP, this writes to a Notifications collection. 
    // For our hackathon engine, we log and return the actionable payload for the frontend state.
    res.status(200).json({
      success: true,
      message: `Transfer request successfully dispatched for asset ${asset.assetTag}.`,
      details: {
        assetId: asset._id,
        requestedBy: req.user._id,
        previousHolder: asset.currentHolder,
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Fetch all assets with structural query filtering
 * @route   GET /api/assets
 * @access  Private (All Authenticated Users)
 */
export const getAssets = async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.category) filters.category = req.query.category;

    const assets = await Asset.find(filters)
      .populate('category', 'name')
      .populate('currentHolder', 'name email')
      .populate('assignedDepartment', 'name code');

    res.status(200).json(assets);
  } catch (error) {
    next(error);
  }
};