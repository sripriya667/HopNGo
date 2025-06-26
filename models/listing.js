const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    price: Number,
    location: String,
    image: {
        type: String,
        default: "https://images.unsplash.com/photo-1748096089012-e601d766815f?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyM3x8fGVufDB8fHx8fA%3D%3D",
        set: (v) =>
            v === ""
            ? "https://images.unsplash.com/photo-1748096089012-e601d766815f?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyM3x8fGVufDB8fHx8fA%3D%3D"
            : v,
    },
    country: String,
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: "Review",
    }]
});

listingSchema.post("findOneAndDelete", async (listing) => {
    if(listing) {
        await Review.deleteMany({_id: {$in : listing.reviews}});
    }
});

//Collection Listing
const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;