import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Helper utility to construct token signatures mapping user objects
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

/**
 * @desc    Register a new user account
 * @route   POST /api/auth/signup
 * @access  Public
 */
export const registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('A user with that email address already exists');
    }

    // Creating the profile. Rule 1: The model default automatically forces the role to 'Employee'
    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid registration data received');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user and return authorization token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password configuration');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Elevate or modify employee roles inside the organization directory
 * @route   PATCH /api/auth/promote/:id
 * @access  Private (Admin Only)
 */
export const updateUserRole = async (req, res, next) => {
  const { role, departmentId } = req.body;

  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error('Target Employee user could not be found');
    }

    if (role) user.role = role;
    if (departmentId) user.department = departmentId;

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      department: updatedUser.department,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Fetch complete directory profiles of all users
 * @route   GET /api/auth/users
 * @access  Private (Admin / Asset Manager / Department Head)
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).populate('department', 'name code').select('-password');
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};