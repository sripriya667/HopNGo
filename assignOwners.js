import mongoose from 'mongoose';
import Listing from './models/listing.js';
import User from './models/user.js';

await mongoose.connect('mongodb+srv://sripriya:8rxOapOgFIsFTnb6@cluster0.9znofej.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

const user = await User.findOne(); // or use User.findById('the_user_id')
if (!user) {
  console.log('No user found!');
  process.exit(1);
}

await Listing.updateMany({}, { owner: user._id });

console.log('All listings now assigned to the existing user.');
await mongoose.disconnect();