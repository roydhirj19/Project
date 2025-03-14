const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const listing  = require("./models/listing.js")
const ExpressError = require("./utility/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
let port = 5000;



const listingRouter = require("./routes/listing.js")
const reviewRouter = require("./routes/review.js")
const userRouter = require("./routes/user.js")

app.set("view engine", "ejs");
app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

// const mongo_Url = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;

const store =MongoStore.create({
  mongoUrl:dbUrl,
  crypto:{
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600
})

store.on("error",()=>{
  console.log("Error in mongo session store",error);
})

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    htppOnly: true,
  }
}

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
})


main()
  .then((res) => {
    console.log("connection Succesfully installed");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}


app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

/** in case if page not found */
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "page not found "));
});

/** Default Error Handling */

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "somthing went wrong" } = err;
  res.status(statusCode).render("error.ejs", { err });
  // res.status(statusCode).send(message);
});

app.listen(port, () => {
  console.log(`app listing on port ${port}`);
});
