const axios = require("axios");
const Listing = require("../models/listing");
const mongoose = require("mongoose");

async function geocodeLocation(location) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`;
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "wanderlust-app"
      }
    });

    if (response.data && response.data.length > 0) {
      const { lat, lon } = response.data[0];
      return {
        type: "Point",
        coordinates: [parseFloat(lon), parseFloat(lat)]
      };
    } else {
      return { type: "Point", coordinates: [0, 0] };
    }
  } catch (error) {
    return { type: "Point", coordinates: [0, 0] };
  }
}

module.exports.index = async (req, res, next) => {
  try {
    const listings = await Listing.find({});
    res.render("listings/index", { allListings: listings });
  } catch (err) {
    next(err);
  }
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new");
};
module.exports.showListings = async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    req.flash("error", "Invalid listing ID.");
    return res.redirect("/listings");
  }
}

module.exports.showListing = async (req, res) => {
  // console.log("🔥 showListing controller hit!");

  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" }
    })
    .populate("owner");


if (!listing.owner) {
  console.log('Owner is null or undefined for this listing!');
  // You can also handle this case, e.g., show a default message or redirect
}
  // console.log("listing object →", listing);

  if (!listing) {
    req.flash("error", "Listing you requested for doesn't exist!");
    return res.redirect("/listings");
  }

  res.render("listings/show", { listing });
};


module.exports.createListing = async (req, res) => {
  try {
    const geometry = await geocodeLocation(req.body.listing.location);
    const newListing = new Listing(req.body.listing);
    newListing.geometry = geometry;
    newListing.images = req.files.map((f) => ({
      url: f.path,
      filename: f.filename,
    }));
    newListing.author = req.user._id;
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "Listing created successfully!");
    res.redirect(`/listings/${newListing._id}`);
  } catch (err) {
    req.flash("error", "Could not create listing.");
    res.redirect("/listings/new");
  }
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  const originalImageUrl = listing.images[0].url;
  const resizedImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250,c_fill");

  res.render("listings/edit", { listing, resizedImageUrl });
};

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const updatedData = { ...req.body.listing };

  // ✅ Re-geocode only if location was changed
  if (updatedData.location) {
    const geometry = await geocodeLocation(updatedData.location);
    updatedData.geometry = geometry;
  }

  const listing = await Listing.findByIdAndUpdate(id, updatedData, { new: true });

  // ✅ Handle updated images
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map(file => ({
      url: file.path,
      filename: file.filename
    }));
    listing.images = newImages;
  }

  await listing.save();
  req.flash("success", "Listing updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted!");
  res.redirect("/listings");
};