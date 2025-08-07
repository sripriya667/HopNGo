const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    price: {
  type: Number,
  required: true,
  min: 0
},
    location: String,
    images: [
  {
    url: String,
    filename: String
  }
],
    country: String,
    category: [String], // Array of categories

    reviews: [{
        type: Schema.Types.ObjectId,
        ref: "Review",
    }],
    owner : {
        type: Schema.Types.ObjectId,
        ref: "User",
        },
 geometry: {
  type: {
    type: String,
    enum: ['Point'], // Only allow "Point"
    required: true
  },
  coordinates: {
    type: [Number],  // Array of numbers: [longitude, latitude]
    required: true
  }
}

        
});

listingSchema.post("findOneAndDelete", async (listing) => {
    if(listing) {
        await Review.deleteMany({_id: {$in : listing.reviews}});
    }
});

//Collection Listing
const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;
