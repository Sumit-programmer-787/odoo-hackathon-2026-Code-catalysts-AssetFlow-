import Booking from '../models/Booking.js';
import Asset from '../models/Asset.js';

/**
 * @desc    Create a new resource booking window (Enforces Rule 3: Overlap Validation)
 * @route   POST /api/bookings
 * @access  Private (All Authenticated Users)
 */
export const createBooking = async (req, res, next) => {
  try {
    const { assetId, startTime, endTime } = req.body;

    const asset = await Asset.findById(assetId);
    if (!asset) {
      res.status(404);
      throw new Error('Target resource asset not found.');
    }

    // Build model instance. The pre-save hook inside models/Booking.js automatically intercepts 
    // and throws an error if an overlapping 'Confirmed' booking window conflicts.
    const booking = new Booking({
      asset: assetId,
      bookedBy: req.user._id,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status: 'Confirmed', // Automatically confirm if it clears validation
    });

    const savedBooking = await booking.save();
    
    // Switch asset state to Reserved if it is an immediate reservation
    if (savedBooking.startTime <= new Date()) {
      asset.status = 'Reserved';
      await asset.save();
    }

    res.status(201).json(savedBooking);
  } catch (error) {
    // The catch block captures the Mongoose model validation error and passes it down cleanly
    res.status(400);
    next(error);
  }
};

/**
 * @desc    Get all active bookings for calendar rendering layouts
 * @route   GET /api/bookings
 * @access  Private (All Authenticated Users)
 */
export const getBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({})
      .populate('asset', 'name assetTag status')
      .populate('bookedBy', 'name email');
    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
};