const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const router = express.Router(); 
const User = require("../models/user");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");

const userController = require("../controllers/users");

router.get("/signup", (userController.renderSignupForm));

router.post("/signup", wrapAsync(userController.signup));

router.get("/login", (userController.renderLoginForm));

router.post(
    "/login", saveRedirectUrl, passport.authenticate("local", {
        failureFlash: true,
        failureRedirect: "/login",
    }),
    userController.login
   )

router.get("/logout", userController.logout);

module.exports = router;