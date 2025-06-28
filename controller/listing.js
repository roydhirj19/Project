const Listing = require("../models/listing")
const { geocodeLocation } = require("../utility/geocoder.js");

module.exports.index = async (req, res, next) => {
    let allListing = await Listing.find({});
    res.render("listing/index.ejs", { allListing });
}

module.exports.renderNewForm = (req, res) => {
    res.render("listing/new.ejs");
}

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author"
            }
        })
        .populate("owner");
    if (!listing) {
        req.flash("error", "listing does not exist!");
        return res.redirect("/listings");
    }
    res.render("listing/show.ejs", { listing });
}

module.exports.creatListing = async (req, res, next) => {
    try {
        let url = req.file.path;
        let filename = req.file.filename
        console.log(`url : ${url} filename: ${filename}`);
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = { url, filename }
        
        // Handle amenities - convert comma-separated string to array
        if (req.body.listing.amenities) {
            newListing.amenities = req.body.listing.amenities
                .split(',')
                .map(amenity => amenity.trim())
                .filter(amenity => amenity.length > 0);
        }
        
        // Handle availability checkbox - if checkbox is unchecked, it won't be in req.body
        newListing.isAvailable = req.body.listing.isAvailable === 'true';
        
        // Geocode the location
        if (newListing.location && newListing.country) {
            console.log(`Geocoding location: ${newListing.location}, ${newListing.country}`);
            newListing.geometry = await geocodeLocation(newListing.location, newListing.country);
            console.log(`Generated coordinates:`, newListing.geometry);
        } else {
            console.log('No location or country provided for geocoding');
        }
        
        await newListing.save();
        req.flash("success", "new listing added");
        res.redirect("/listings");
    } catch (error) {
        console.error('Error creating listing:', error);
        req.flash("error", "Failed to create listing. Please try again.");
        res.redirect("/listings/new");
    }
}

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "listing does not exist!");
        return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("upload","upload/w_300,c_fill");
    res.render("listing/edit.ejs", { listing ,originalImageUrl});
}

module.exports.updateListing = async (req, res) => {
    try {
        let { id } = req.params;
        let listing = await Listing.findById(id);
        
        if (!listing) {
            req.flash("error", "Listing not found!");
            return res.redirect("/listings");
        }
        
        // Update basic fields
        Object.assign(listing, req.body.listing);
        
        // Handle amenities - convert comma-separated string to array
        if (req.body.listing.amenities) {
            listing.amenities = req.body.listing.amenities
                .split(',')
                .map(amenity => amenity.trim())
                .filter(amenity => amenity.length > 0);
        }
        
        // Handle availability checkbox - if checkbox is unchecked, it won't be in req.body
        listing.isAvailable = req.body.listing.isAvailable === 'true';
        
        // Geocode the location if location or country changed
        if (req.body.listing.location && req.body.listing.country) {
            listing.geometry = await geocodeLocation(req.body.listing.location, req.body.listing.country);
        }
        
        if (typeof req.file !== "undefined") {
            let url = req.file.path;
            let filename = req.file.filename;
            listing.image = { url, filename }
        }
        
        await listing.save();
        req.flash("success", "listing updated");
        res.redirect(`/listings/${id}`);
    } catch (error) {
        console.error('Error updating listing:', error);
        req.flash("error", "Failed to update listing. Please try again.");
        res.redirect(`/listings/${req.params.id}/edit`);
    }
}

module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    const deleteListing = await Listing.findByIdAndDelete(id);
    req.flash("error", "Listing removed");
    res.redirect("/listings");
}