const Listing = require("../models/listing.js");
const Review = require("../models/review.js");


module.exports.creatReview = async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id; // to add author
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success", "new review added");
    res.redirect(`/listings/${listing._id}`);
}

module.exports.deteleReview = async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("error", "review removed");
    res.redirect(`/listings/${id}`);
}