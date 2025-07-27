import mongoose from 'mongoose';
import Listing from './models/listing.js';

await mongoose.connect('mongodb+srv://sripriya:8rxOapOgFIsFTnb6@cluster0.9znofej.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

const listings = await Listing.find({});

for (let listing of listings) {
  let changed = false;

  // Fix owner field
  if (listing.owner && typeof listing.owner === 'string') {
    listing.owner = new mongoose.Types.ObjectId(listing.owner);
    changed = true;
  }

  // Fix image subdocument _id fields (if needed)
  if (listing.images && Array.isArray(listing.images)) {
    listing.images = listing.images.map(img => {
      if (img._id && typeof img._id === 'string') {
        img._id = new mongoose.Types.ObjectId(img._id);
        changed = true;
      }
      return img;
    });
  }

  if (changed) await listing.save();
}

console.log('Owner and image references fixed!');
await mongoose.disconnect();