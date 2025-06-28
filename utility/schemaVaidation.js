const Joi = require("joi");
const review = require("../models/review");
module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().min(5).required(),
    description: Joi.string().required(),
    image: Joi.string().allow("", null),
    price: Joi.number().min(0).required(),
    country: Joi.string().required(),
    location: Joi.string().required(),
    email: Joi.string().email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    }),
    // Booking-related fields
    roomType: Joi.string().valid('Private Room', 'Shared Room', 'Entire Place').default('Private Room'),
    maxGuests: Joi.number().integer().min(1).max(10).default(2),
    amenities: Joi.string().allow("", null),
    isAvailable: Joi.boolean().default(true),
    // Contact Information
    contactInfo: Joi.object({
      phone: Joi.string().allow("", null),
      mobile: Joi.string().allow("", null),
      email: Joi.string().email().allow("", null),
      address: Joi.string().allow("", null),
      emergencyContact: Joi.string().allow("", null)
    }).optional(),
  }).required(),
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().required(),
  }).required(),
});




