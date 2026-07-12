import Department from '../models/Department.js';

/**
 * @desc    Create a new department
 * @route   POST /api/departments
 * @access  Private (Admin)
 */
export const createDepartment = async (req, res, next) => {
  try {
    const { name, code, manager } = req.body;

    const exists = await Department.findOne({ $or: [{ name }, { code }] });
    if (exists) {
      res.status(400);
      throw new Error(`Department with that name or code already exists.`);
    }

    const department = await Department.create({ name, code, manager });
    res.status(201).json(department);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Fetch all departments
 * @route   GET /api/departments
 * @access  Private (All Authenticated Users)
 */
export const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find({}).populate('manager', 'name email');
    res.status(200).json(departments);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a department
 * @route   PATCH /api/departments/:id
 * @access  Private (Admin)
 */
export const updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      res.status(404);
      throw new Error('Department not found.');
    }

    const { name, code, manager } = req.body;
    if (name) department.name = name;
    if (code) department.code = code;
    if (manager) department.manager = manager;

    const updated = await department.save();
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a department
 * @route   DELETE /api/departments/:id
 * @access  Private (Admin)
 */
export const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      res.status(404);
      throw new Error('Department not found.');
    }
    await department.deleteOne();
    res.status(200).json({ success: true, message: 'Department removed.' });
  } catch (error) {
    next(error);
  }
};