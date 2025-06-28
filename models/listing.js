const { types } = require("joi");
const mongoose = require("mongoose");
const cloudinary = require('cloudinary').v2;
let Schema = mongoose.Schema;
// let Review = require("./review.js")
let listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description:{
    type: String,
    required : true,
  },

  image: {
    url:String,
    filename:String,
  },
  price: Number,
  location: String,
  country: String,
  geometry: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  // Booking related fields
  isAvailable: {
    type: Boolean,
    default: true
  },
  maxGuests: {
    type: Number,
    default: 2
  },
  roomType: {
    type: String,
    enum: ['Private Room', 'Shared Room', 'Entire Place'],
    default: 'Private Room'
  },
  amenities: [{
    type: String
  }],
  // Contact Information
  contactInfo: {
    phone: {
      type: String,
      default: ""
    },
    mobile: {
      type: String,
      default: ""
    },
    email: {
      type: String,
      default: ""
    },
    address: {
      type: String,
      default: ""
    },
    emergencyContact: {
      type: String,
      default: ""
    }
  },
  bookings: [{
    type: Schema.Types.ObjectId,
    ref: "Booking"
  }],
  reviews:[
    {
      type: Schema.Types.ObjectId,
      ref: "Review"
    }
  ],
  owner:{
    type: Schema.Types.ObjectId,
    ref:"User"
  }
});

// listingSchema.post("findOneAndDelete",async(listing)=>{
//   await Review.deleteMany({_id: {$in: listing.reviews}})
// })


listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    const Review = require("./review.js"); // Import Review model inside the middleware
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
  /** for if listing is delete then clean the cloudnary sapce whatever that specific listing is require */
  if (listing.image && listing.image.filename) {
    await cloudinary.uploader.destroy(listing.image.filename);
  }
});

const Listing = mongoose.model("Listing",listingSchema);
module.exports = Listing;
