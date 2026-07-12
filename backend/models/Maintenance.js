import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Asset undergoing maintenance is required'],
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporting user reference is required'],
    },
    issueDescription: {
      type: String,
      required: [true, 'Please provide structural technical details of the fault'],
    },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending Approval', 'Approved', 'In Progress', 'Resolved', 'Rejected'],
      default: 'Pending Approval',
    },
    cost: {
      type: Number,
      default: 0,
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Post-save middleware executing Lifecycle Rule 4: Handle automated asset state mutations on approval/resolution
maintenanceSchema.post('save', async function (doc, next) {
  try {
    if (doc.status === 'Approved' || doc.status === 'In Progress') {
      await mongoose.model('Asset').findByIdAndUpdate(doc.asset, {
        status: 'Under Maintenance',
      });
    } else if (doc.status === 'Resolved') {
      await mongoose.model('Asset').findByIdAndUpdate(doc.asset, {
        status: 'Available',
        currentHolder: null, // Clear active holder context upon general hardware cleanup
      });
    }
    next();
  } catch (error) {
    console.error(`🚨 Maintenance Lifecycle hook sync execution error: ${error.message}`);
    next(error);
  }
});

const Maintenance = mongoose.model('Maintenance', maintenanceSchema);
export default Maintenance;