import mongoose from 'mongoose';

const auditDiscrepancySchema = new mongoose.Schema({
  asset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: true,
  },
  expectedStatus: { type: String, required: true },
  foundStatus: { type: String, enum: ['Present', 'Missing', 'Damaged'], required: true },
  notes: { type: String },
});

const auditSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Audit run baseline identity title is required'],
      trim: true,
    },
    auditor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assigned primary auditor user required'],
    },
    discrepancies: [auditDiscrepancySchema],
    status: {
      type: String,
      enum: ['Scheduled', 'In Progress', 'Completed'],
      default: 'Scheduled',
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save/Update execution for Lifecycle Rule 4: If an audit marks items as Missing and closes, set asset states to 'Lost'
auditSchema.pre('save', async function (next) {
  if (this.isModified('status') && this.status === 'Completed') {
    this.completedAt = new Date();
    try {
      const missingAssetIds = this.discrepancies
        .filter((item) => item.foundStatus === 'Missing')
        .map((item) => item.asset);

      if (missingAssetIds.length > 0) {
        await mongoose.model('Asset').updateMany(
          { _id: { $in: missingAssetIds } },
          { status: 'Lost' }
        );
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

const Audit = mongoose.model('Audit', auditSchema);
export default Audit;