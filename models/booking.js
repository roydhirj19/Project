const mongoose = require("mongoose");
let Schema = mongoose.Schema;

let bookingSchema = new Schema({
  listing: {
    type: Schema.Types.ObjectId,
    ref: "Listing",
    required: true
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: {
    type: Date,
    required: true
  },
  checkInTime: {
    type: String,
    default: "15:00", // Default 3:00 PM
    validate: {
      validator: function(v) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Check-in time must be in HH:MM format'
    }
  },
  checkOutTime: {
    type: String,
    default: "11:00", // Default 11:00 AM
    validate: {
      validator: function(v) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Check-out time must be in HH:MM format'
    }
  },
  numberOfGuests: {
    type: Number,
    required: true,
    min: 1
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  specialRequests: {
    type: String,
    maxlength: 500
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  }
});

// Middleware to check for booking conflicts
bookingSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('checkIn') || this.isModified('checkOut')) {
    const Booking = this.constructor;
    
    // Check for overlapping bookings
    const conflictingBooking = await Booking.findOne({
      listing: this.listing,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          checkIn: { $lt: this.checkOut },
          checkOut: { $gt: this.checkIn }
        }
      ]
    });

    if (conflictingBooking) {
      const error = new Error('This room is not available for the selected dates');
      error.name = 'BookingConflictError';
      return next(error);
    }
  }
  next();
});

// Method to calculate total price
bookingSchema.methods.calculateTotalPrice = function(pricePerNight) {
  const nights = Math.ceil((this.checkOut - this.checkIn) / (1000 * 60 * 60 * 24));
  return nights * pricePerNight;
};

// Static method to check availability
bookingSchema.statics.checkAvailability = async function(listingId, checkIn, checkOut) {
  const conflictingBooking = await this.findOne({
    listing: listingId,
    status: { $in: ['pending', 'confirmed'] },
    $or: [
      {
        checkIn: { $lt: checkOut },
        checkOut: { $gt: checkIn }
      }
    ]
  });
  
  return !conflictingBooking;
};

module.exports = mongoose.model("Booking", bookingSchema); 