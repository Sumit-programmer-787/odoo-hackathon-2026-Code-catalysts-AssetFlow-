import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Target resource asset reference is required'],
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User making the booking reservation is required'],
    },
    startTime: {
      type: Date,
      required: [true, 'Reservation start time window is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'Reservation end time window is required'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save validation hook enforcing Rule 3: No overlapping time slots for the same shared asset resource
bookingSchema.pre('save', async function (next) {
  if (!this.isModified('startTime') && !this.isModified('endTime')) {
    return next();
  }

  try {
    const overlappingBooking = await mongoose.model('Booking').findOne({
      _id: { $ne: this._id }, // Exclude current document if updating
      asset: this.asset,
      status: 'Confirmed',
      $or: [
        { startTime: { $lt: this.endTime }, endTime: { $gt: this.startTime } },
      ],
    });

    if (overlappingBooking) {
      throw new Error(
        `Reservation conflict: This resource is already booked from ${overlappingBooking.startTime.toISOString()} to ${overlappingBooking.endTime.toISOString()}.`
      );
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;