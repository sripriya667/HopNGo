const express = require("express");
const router = express.Router({ mergeParams: true }); 
const wrapAsync  = require("../utils/wrapAsync");
const { listingSchema } = require("../schema");
const ExpressError  = require("../utils/ExpressError");
const Listing = require ("../models/listing");


const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    if(error){
    let errMsg = error.details.map(el => el.message).join(',');
    throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

//INDEX ROUTE
router.get("/", wrapAsync(async(req, res) => {
    const allListings = await Listing.find({});
        res.render("./listings/index.ejs", {allListings});
}))

//NEW ROUTE
router.get("/new", (req, res) => {
    res.render("./listings/new.ejs");
    })

//SHOW ROUTE
router.get("/:id", wrapAsync(async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if(!listing) {
        req.flash("error", "Listing you requested for doesn't exist!");
        return res.redirect("/listings");
    }
    res.render("./listings/show.ejs", {listing});
}))

//CREATE ROUTE
router.post(
    "/",
    validateListing,
    wrapAsync( async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash("success", "New listing created!");
    res.redirect("/listings");
})
);

//EDIT ROUTE
router.get("/:id/edit", wrapAsync(async(req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing you requested for doesn't exist!");
        return res.redirect("/listings");
    }
    res.render("./listings/edit.ejs", {listing});
}))

//UPDATE ROUTE
router.put("/:id", wrapAsync(async (req, res) =>{
      if(!req.body.listing){
            throw new ExpressError(400, "Send valid data for listing");
        }
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    req.flash("success", "Listing updated!");
    res.redirect(`/listings/${id}`);
}))

//DELETE ROUTE
router.delete("/:id", wrapAsync(async (req, res) =>{
    let {id} = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", " listing Deleted!");
    res.redirect("/listings");
}))

module.exports = router;