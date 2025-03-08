const { types } = require("joi");
const mongoose = require("mongoose");
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
});

const Listing = mongoose.model("Listing",listingSchema);
module.exports = Listing;
