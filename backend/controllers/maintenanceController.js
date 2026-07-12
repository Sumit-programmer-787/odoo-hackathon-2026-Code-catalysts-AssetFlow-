import Maintenance from '../models/Maintenance.js';
import Asset from '../models/Asset.js';

/**
 * @desc    File a new maintenance request for an asset
 * @route   POST /api/maintenance
 * @access  Private (All Authenticated Users)
 */
export const createMaintenanceRequest = async (req, res, next) => {
  try {
    const { assetId, issueDescription, severity } = req.body;

    const asset = await Asset.findById(assetId);
    if (!asset) {
      res.status(404);
      throw new Error('Asset not found.');
    }

    const ticket = await Maintenance.create({
      asset: assetId,
      reportedBy: req.user._id,
      issueDescription,
      severity,
    });

    res.status(201).json(ticket);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update maintenance ticket status (Triggers Lifecycle Rule 4 via Post-Save Hook)
 * @route   PATCH /api/maintenance/:id/status
 * @access  Private (Admin / Asset Manager)
 */
export const updateMaintenanceStatus = async (req, res, next) => {
  try {
    const { status, cost } = req.body;
    const ticket = await Maintenance.findById(req.params.id);

    if (!ticket) {
      res.status(404);
      throw new Error('Maintenance ticket not found.');
    }

    ticket.status = status;
    if (cost) ticket.cost = cost;
    if (status === 'Resolved') ticket.resolvedAt = new Date();

    // Saving triggers the post('save') hook in models/Maintenance.js 
    // to automatically cycle Asset statuses between 'Under Maintenance' and 'Available'
    const updatedTicket = await ticket.save();
    res.status(200).json(updatedTicket);
  } catch (error) {
    next(error);
  }
};