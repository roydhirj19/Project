const Listing = require("../models/listing")

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
        res.redirect("/listings")
    }
    res.render("listing/show.ejs", { listing });
}

module.exports.creatListing = async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename
    console.log(`url : ${url} filename: ${filename}`);
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename }
    await newListing.save();
    req.flash("success", "new listing added");
    res.redirect("/listings");
}

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "listing does not exist!");
        res.redirect("/listings")
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("upload","upload/w_300,c_fill");
        res.render("listing/edit.ejs", { listing ,originalImageUrl});
}

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename }
        await listing.save();
    }
    req.flash("success", "listing upadated");
    res.redirect(`/listings/${id}`);
}

module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    const deleteListing = await Listing.findByIdAndDelete(id);
    req.flash("error", "Listing removed");
    res.redirect("/listings");
}