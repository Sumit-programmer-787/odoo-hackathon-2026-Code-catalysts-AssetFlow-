import Audit from '../models/Audit.js';
import Asset from '../models/Asset.js';

/**
 * @desc    Initialize a system-wide or category-specific audit cycle with automated discrepancy maps
 * @route   POST /api/audits
 * @access  Private (Admin / Asset Manager)
 */
export const initiateAudit = async (req, res, next) => {
  try {
    const { title, categoryId } = req.body;

    // Pull assets matching criteria to pre-populate discrepancy map snapshots
    const query = categoryId ? { category: categoryId } : {};
    const targetAssets = await Asset.find(query);

    // Auto-generate expected statuses for the audit baseline snapshot
    const initialDiscrepancies = targetAssets.map((asset) => ({
      asset: asset._id,
      expectedStatus: asset.status,
      foundStatus: 'Present', // Default assumption until field verification
      notes: 'Initial snapshot baseline.',
    }));

    const audit = await Audit.create({
      title,
      auditor: req.user._id,
      discrepancies: initialDiscrepancies,
      status: 'Scheduled',
    });

    res.status(201).json(audit);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit reconciliation updates for single assets during an ongoing audit field pass
 * @route   PATCH /api/audits/:id/reconcile
 * @access  Private (Admin / Asset Manager)
 */
export const updateAuditItem = async (req, res, next) => {
  try {
    const { assetId, foundStatus, notes } = req.body;
    const audit = await Audit.findById(req.params.id);

    if (!audit || audit.status === 'Completed') {
      res.status(400);
      throw new Error('Audit session not found or already finalized.');
    }

    const itemIndex = audit.discrepancies.findIndex((d) => d.asset.toString() === assetId);
    if (itemIndex === -1) {
      res.status(404);
      throw new Error('Asset reference target not found inside this snapshot run.');
    }

    audit.discrepancies[itemIndex].foundStatus = foundStatus;
    audit.discrepancies[itemIndex].notes = notes;
    
    if (audit.status === 'Scheduled') audit.status = 'In Progress';

    await audit.save();
    res.status(200).json({ success: true, message: 'Item checked.' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Close audit cycle (Triggers Lifecycle Rule 4 via Pre-Save hook converting confirmed missing assets to 'Lost')
 * @route   PATCH /api/audits/:id/close
 * @access  Private (Admin / Asset Manager)
 */
export const closeAudit = async (req, res, next) => {
  try {
    const audit = await Audit.findById(req.params.id);
    if (!audit) {
      res.status(404);
      throw new Error('Audit run not found.');
    }

    audit.status = 'Completed';
    // Mongoose hooks catch this edit execution, closing out targets and running the updateMany query onto Asset records
    await audit.save();

    res.status(200).json({
      success: true,
      message: 'Audit finalized. Confirmed missing objects updated to status: Lost.',
      audit,
    });
  } catch (error) {
    next(error);
  }
};