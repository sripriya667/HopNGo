const express = require("express");
const app = express(); // mergeParams is a boolean that allows us to access the params of the parent route
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError  = require("./utils/ExpressError");
const session = require("express-session");
const flash = require("connect-flash");


const listings = require("./routes/listing")
const reviews = require("./routes/review")

const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';

main()
.then(() =>{
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.log(err)
});

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true})); //used to parse the data from the form
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "public")));

const sessionOptions = { 
    secret : "mysupersecretstring",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
}

app.get("/", (req, res) => {
    res.send("Hello World!");
})

app.use(session(sessionOptions));
app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
})

app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);

app.all("/random", (req, res, next) => {
    next(new ExpressError(404, "page not found"))
})

app.use((err, req, res, next) => {
    let {status = 500, message = "Something went wrong"} = err;
    res.status(status).render("error.ejs", {err});
    // res.status(status).send(message);
})

app.listen(8080, () => {
    console.log("Server is running on port 8080");
})