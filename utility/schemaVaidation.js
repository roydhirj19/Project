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
  }).required(),
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().required(),
  }).required(),
});




