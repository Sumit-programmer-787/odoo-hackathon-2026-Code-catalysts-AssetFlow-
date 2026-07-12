import AssetCategory from '../models/AssetCategory.js';

/**
 * @desc    Create a new asset category
 * @route   POST /api/categories
 * @access  Private (Admin / Asset Manager)
 */
export const createCategory = async (req, res, next) => {
  try {
    const { name, description, requiredFields } = req.body;

    const exists = await AssetCategory.findOne({ name });
    if (exists) {
      res.status(400);
      throw new Error(`Category "${name}" already exists.`);
    }

    const category = await AssetCategory.create({ name, description, requiredFields });
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Fetch all asset categories
 * @route   GET /api/categories
 * @access  Private (All Authenticated Users)
 */
export const getCategories = async (req, res, next) => {
  try {
    const categories = await AssetCategory.find({});
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an asset category
 * @route   PATCH /api/categories/:id
 * @access  Private (Admin / Asset Manager)
 */
export const updateCategory = async (req, res, next) => {
  try {
    const category = await AssetCategory.findById(req.params.id);
    if (!category) {
      res.status(404);
      throw new Error('Category not found.');
    }

    const { name, description, requiredFields } = req.body;
    if (name) category.name = name;
    if (description) category.description = description;
    if (requiredFields) category.requiredFields = requiredFields;

    const updated = await category.save();
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an asset category
 * @route   DELETE /api/categories/:id
 * @access  Private (Admin / Asset Manager)
 */
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await AssetCategory.findById(req.params.id);
    if (!category) {
      res.status(404);
      throw new Error('Category not found.');
    }
    await category.deleteOne();
    res.status(200).json({ success: true, message: 'Category removed.' });
  } catch (error) {
    next(error);
  }
};