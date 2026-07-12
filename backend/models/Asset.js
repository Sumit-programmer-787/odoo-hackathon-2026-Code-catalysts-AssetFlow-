import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema(
  {
    assetTag: {
      type: String,
      required: [true, 'Unique asset tag tracking number is required'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Asset hardware/software name is required'],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AssetCategory',
      required: [true, 'Asset must belong to a distinct category'],
    },
    status: {
      type: String,
      enum: [
        'Available',
        'Allocated',
        'Reserved',
        'Under Maintenance',
        'Lost',
        'Retired',
        'Disposed',
      ],
      default: 'Available',
    },
    currentHolder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Track who explicitly holds this asset to execute conflict validation hooks
    },
    assignedDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    location3D: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      z: { type: Number, default: 0 },
    },
    metadata: {
      type: Map,
      of: String, // Accommodates heterogeneous dynamic attributes across different asset categories
    },
  },
  {
    timestamps: true,
  }
);

// Indexes optimizing high-frequency lookups on asset directories
assetSchema.index({ assetTag: 1 });
assetSchema.index({ status: 1 });

const Asset = mongoose.model('Asset', assetSchema);
export default Asset;