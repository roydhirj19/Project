const Listing = require("./models/listing.js");
const Review = require("./models/review.js")
const ExpressError = require("./utility/ExpressError.js");
const { listingSchema, reviewSchema } = require("./utility/schemaVaidation.js");
const { equal } = require("joi");



module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {  // to check user is logged in or not 
        req.session.redirectUrl = req.originalUrl; // jaha se hm login hona chah rhe hai
        req.flash("error", "you must be logged in");
        return res.redirect("/login")
    }
    next();
};

/** jis route par login kiye hai wahi pr land krne ke liye */
module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next()
};



/** to protect from user who is not logged in but try to access from using hoppsctoch or any others sides */

module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner.equals(res.locals.currUser._id)) {
        req.flash("error", "you are not owner of this listing")
        return res.redirect(`/listings/${id}`)
    }
    next()
}

module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    console.log(review);
    
    if (!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "you are not owner of this listing")
        return res.redirect(`/listings/${id}`)
    }
    next()
}

module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(404, errMsg);
    } else {
        next();
    }
};

module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(404, errMsg);
    } else {
        next();
    }
};

