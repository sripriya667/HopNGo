const mongoose = require("mongoose");
const axios = require("axios");
const Listing = require("./models/listing.js");

async function geocodeLocation(location) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    location
  )}`;
  const response = await axios.get(url, {
    headers: { "User-Agent": "wanderlust-app" },
  });
  if (response.data && response.data.length > 0) {
    return {
      lat: parseFloat(response.data[0].lat),
      lng: parseFloat(response.data[0].lon),
    };
  }
  return { lat: 0, lng: 0 };
}

async function backfill() {
  await mongoose.connect("mongodb://localhost:27017/wanderlust");
  const listings = await Listing.find({
    $or: [
      { "geometry.coordinates": { $eq: [0, 0] } },
      { geometry: { $exists: false } },
      { "geometry.coordinates": { $exists: false } },
    ],
  });

  for (let listing of listings) {
    const location = `${listing.location}, ${listing.country}`;
    const coords = await geocodeLocation(location);
    if (coords.lat !== 0 && coords.lng !== 0) {
      listing.geometry = {
        type: "Point",
        coordinates: [coords.lng, coords.lat],
      };
      await listing.save();
      console.log(`Updated: ${listing.title} -> ${coords.lat}, ${coords.lng}`);
    } else {
      console.log(`Could not geocode: ${listing.title}`);
    }
  }
  mongoose.connection.close();
}

backfill();