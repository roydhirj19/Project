const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");
const wrapAsync = require("../utility/wrapAsync.js");

module.exports.renderBookingForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    
    if (!listing.isAvailable) {
        req.flash("error", "This listing is not available for booking!");
        return res.redirect(`/listings/${id}`);
    }
    
    res.render("booking/new.ejs", { listing });
};

module.exports.createBooking = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    
    if (!listing.isAvailable) {
        req.flash("error", "This listing is not available for booking!");
        return res.redirect(`/listings/${id}`);
    }
    
    const { checkIn, checkOut, checkInTime, checkOutTime, numberOfGuests, nights, specialRequests } = req.body.booking;
    
    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (checkInDate < today) {
        req.flash("error", "Check-in date cannot be in the past!");
        return res.redirect(`/listings/${id}/book`);
    }
    
    if (checkOutDate <= checkInDate) {
        req.flash("error", "Check-out date must be after check-in date!");
        return res.redirect(`/listings/${id}/book`);
    }
    
    if (numberOfGuests > listing.maxGuests) {
        req.flash("error", `Maximum ${listing.maxGuests} guests allowed for this listing!`);
        return res.redirect(`/listings/${id}/book`);
    }
    
    // Check availability
    const isAvailable = await Booking.checkAvailability(id, checkInDate, checkOutDate);
    if (!isAvailable) {
        req.flash("error", "This listing is not available for the selected dates!");
        return res.redirect(`/listings/${id}/book`);
    }
    
    // Calculate total price - use manual nights if provided, otherwise calculate from dates
    let numberOfNights;
    if (nights && parseInt(nights) > 0) {
        numberOfNights = parseInt(nights);
    } else {
        numberOfNights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    }
    const totalPrice = numberOfNights * listing.price;
    
    // Create booking
    const booking = new Booking({
        listing: id,
        customer: req.user._id,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        checkInTime: checkInTime || "15:00",
        checkOutTime: checkOutTime || "11:00",
        numberOfGuests: parseInt(numberOfGuests),
        totalPrice: totalPrice,
        specialRequests: specialRequests || ""
    });
    
    await booking.save();
    
    // Add booking to listing
    listing.bookings.push(booking._id);
    await listing.save();
    
    req.flash("success", "Booking created successfully! Please complete payment to confirm.");
    res.redirect(`/bookings/${booking._id}`);
});

module.exports.showBooking = async (req, res) => {
    const { id } = req.params;
    const booking = await Booking.findById(id)
        .populate("listing")
        .populate("customer");
    
    if (!booking) {
        req.flash("error", "Booking not found!");
        return res.redirect("/listings");
    }
    
    // Check if user is authorized to view this booking
    if (!req.user._id.equals(booking.customer._id) && !req.user._id.equals(booking.listing.owner._id)) {
        req.flash("error", "You don't have permission to view this booking!");
        return res.redirect("/listings");
    }
    
    res.render("booking/show.ejs", { booking });
};

module.exports.index = async (req, res) => {
    const bookings = await Booking.find({ customer: req.user._id })
        .populate("listing")
        .sort({ bookingDate: -1 });
    
    res.render("booking/index.ejs", { bookings });
};

module.exports.cancelBooking = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    
    if (!booking) {
        req.flash("error", "Booking not found!");
        return res.redirect("/bookings");
    }
    
    // Check if user is authorized to cancel this booking
    if (!req.user._id.equals(booking.customer)) {
        req.flash("error", "You don't have permission to cancel this booking!");
        return res.redirect("/bookings");
    }
    
    // Check if booking can be cancelled (not too close to check-in)
    const checkInDate = new Date(booking.checkIn);
    const today = new Date();
    const daysUntilCheckIn = Math.ceil((checkInDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilCheckIn <= 1) {
        req.flash("error", "Bookings can only be cancelled at least 24 hours before check-in!");
        return res.redirect(`/bookings/${id}`);
    }
    
    booking.status = "cancelled";
    await booking.save();
    
    req.flash("success", "Booking cancelled successfully!");
    res.redirect("/bookings");
});

module.exports.confirmBooking = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const booking = await Booking.findById(id)
        .populate("listing");
    
    if (!booking) {
        req.flash("error", "Booking not found!");
        return res.redirect("/bookings");
    }
    
    // Check if user is the listing owner
    if (!req.user._id.equals(booking.listing.owner)) {
        req.flash("error", "You don't have permission to confirm this booking!");
        return res.redirect("/bookings");
    }
    
    booking.status = "confirmed";
    booking.paymentStatus = "paid";
    await booking.save();
    
    req.flash("success", "Booking confirmed successfully!");
    res.redirect(`/bookings/${id}`);
}); 