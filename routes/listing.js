const express = require("express");
const router = express.Router();
const wrapAsync = require("../utility/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controller/listing.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js")
const upload = multer({ storage })

router.route("/")
  .get(
    wrapAsync(listingController.index)
  )
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.creatListing)

  );


router.get("/new", isLoggedIn, listingController.renderNewForm);

router.route("/:id")
  .get(
    wrapAsync(listingController.showListing)
  )
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.deleteListing)
  );

/** Edit route */
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

module.exports = router;




/** Index route */
// router.get(
//   "/",
//   wrapAsync(listingController.index)
// );


/** Update route */

// router.put(
//   "/:id",
//   isLoggedIn,
//   isOwner,
//   validateListing,
//   wrapAsync(listingController.updateListing)
// );


/** Show route */

// router.get(
//   "/:id",
//   wrapAsync(listingController.showListing)
// );

// /** create route */
// router.post(
//   "/",
//   isLoggedIn,
//   validateListing,
//   wrapAsync(listingController.creatListing)
// );

/** Delete route */
// router.delete(
//   "/:id",
//   isLoggedIn,
//   isOwner,
//   wrapAsync(listingController.deleteListing)
// );

/** add new */

// router.get("/new", isLoggedIn, listingController.renderNewForm)

