import mongoose from 'mongoose';

const assetCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required (e.g., Laptops, Server Blades, Furnishings)'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    requiredFields: [
      {
        type: String, // Captures keys needed in the Asset's metadata Map for this custom asset type
      }
    ],
  },
  {
    timestamps: true,
  }
);

const AssetCategory = mongoose.model('AssetCategory', assetCategorySchema);
export default AssetCategory;