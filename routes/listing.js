const express = require("express");
const router = express.Router({ mergeParams: true }); 
const wrapAsync  = require("../utils/wrapAsync");
const Listing = require ("../models/listing");
const { isLoggedIn, isOwner, validateListing } = require("../middleware");
const listingController = require("../controllers/listings");
const multer  = require('multer')
const {  storage } = require("../cloudConfig");
const upload = multer({ storage });

// Removed redundant route: router.post("/listings", listingController.createListing)

router
    .route("/")
    .get(wrapAsync(listingController.index)) // INDEX route
    .post(isLoggedIn,upload.array("listing[images]"),validateListing, wrapAsync(listingController.createListing)); // CREATE route

 //NEW ROUTE
router.get("/new", isLoggedIn, listingController.renderNewForm);

//SHOW route
router.get("/:id", isLoggedIn, wrapAsync(listingController.showListing));

//UPDATE route
router.put("/:id", isLoggedIn, isOwner,upload.array("listing[images]"), validateListing, wrapAsync(listingController.updateListing));

//DELETE route
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

//EDIT ROUTE
router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;
