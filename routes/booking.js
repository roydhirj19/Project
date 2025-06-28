const express = require("express");
const router = express.Router();
const bookingController = require("../controller/booking.js");
const { isLoggedIn, isOwner } = require("../middleware.js");

// All booking routes require authentication
router.use(isLoggedIn);

// Show booking form
router.get("/listings/:id/book", bookingController.renderBookingForm);

// Create new booking
router.post("/listings/:id/book", bookingController.createBooking);

// Show all bookings for current user
router.get("/bookings", bookingController.index);

// Show specific booking
router.get("/bookings/:id", bookingController.showBooking);

// Cancel booking (only by customer)
router.delete("/bookings/:id", bookingController.cancelBooking);

// Confirm booking (only by listing owner)
router.patch("/bookings/:id/confirm", bookingController.confirmBooking);

module.exports = router; 