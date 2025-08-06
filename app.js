if(process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express(); // mergeParams is a boolean that allows us to access the params of the parent route
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError  = require("./utils/ExpressError");
const MongoStore = require('connect-mongo');
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");


const listingRouter = require("./routes/listing")
const reviewRouter = require("./routes/review")
const userRouter = require("./routes/user")

// const MONGO_URL = 'mongodb://127.0.0.1:27017/HopNGo';
const dbUrl = process.env.ATLASDB_URL;

main()
.then(() =>{
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.log(err)
});

async function main() {
    await mongoose.connect(dbUrl, {
        tls: true
    });
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true})); //used to parse the data from the form
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "public")));


app.use((req, res, next) => {
  res.locals.currUser = req.user;
  next();
});


const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600, // time in seconds after which the session
});

store.on("error", function(e) {
    console.log("Session store error", e);
});

const sessionOptions = { 
    store,
    secret : process.env.SECRET || 3000,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
}



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize()); //initializes the passport
app.use(passport.session()); //uses the passport for session 
passport.use(new LocalStrategy(User.authenticate())); //uses the passport for authentication

passport.serializeUser(User.serializeUser()); //serializes the user
passport.deserializeUser(User.deserializeUser()); //deserializes the user

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

app.get("/demouser", async (req, res) =>{
    let fakeUser = new User({
        email: "test@gmail.com",
        username: "testuser",
    })
    let registeredUser = await User.register(fakeUser, "12345678");
    res.send(registeredUser);
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.all("/random", (req, res, next) => {
    next(new ExpressError(404, "page not found"))
})

app.use((err, req, res, next) => {
    let {status = 500, message = "Something went wrong"} = err;
    res.status(status).render("error.ejs", {err});
    // res.status(status).send(message);
})

// Root route
app.get("/", (req, res) => {
  res.redirect("/listings"); // Or: res.render("home");
});

// PORT fix for Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});