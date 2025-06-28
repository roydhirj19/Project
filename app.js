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
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const User = require("./models/user.js");
let port = 5000;



const listingRouter = require("./routes/listing.js")
const reviewRouter = require("./routes/review.js")
const userRouter = require("./routes/user.js")
const bookingRouter = require("./routes/booking.js")

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

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });
        
        if (user) {
            return done(null, user);
        }
        
        // Check if user exists with same email
        user = await User.findOne({ email: profile.emails[0].value });
        
        if (user) {
            // Link Google account to existing user
            user.googleId = profile.id;
            user.displayName = profile.displayName;
            user.profilePicture = profile.photos[0]?.value;
            // Only set username if user doesn't have one
            if (!user.username) {
                user.username = profile.displayName || `user_${profile.id.slice(-6)}`;
            }
            await user.save();
            return done(null, user);
        }
        
        // Create new user with better username
        const displayName = profile.displayName || `User ${profile.id.slice(-6)}`;
        const username = displayName.replace(/\s+/g, '_').toLowerCase();
        
        user = new User({
            username: username,
            googleId: profile.id,
            email: profile.emails[0].value,
            displayName: displayName,
            profilePicture: profile.photos[0]?.value
        });
        
        await user.save();
        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

// LinkedIn OAuth Strategy
if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
    passport.use(new LinkedInStrategy({
        clientID: process.env.LINKEDIN_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        callbackURL: "/auth/linkedin/callback",
        scope: ['r_emailaddress', 'r_liteprofile']
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user already exists
            let user = await User.findOne({ linkedinId: profile.id });
            
            if (user) {
                return done(null, user);
            }
            
            // Check if user exists with same email
            const email = profile.emails[0]?.value;
            if (email) {
                user = await User.findOne({ email: email });
                
                if (user) {
                    // Link LinkedIn account to existing user
                    user.linkedinId = profile.id;
                    user.displayName = profile.displayName;
                    user.profilePicture = profile.photos[0]?.value;
                    // Only set username if user doesn't have one
                    if (!user.username) {
                        user.username = profile.displayName || `user_${profile.id.slice(-6)}`;
                    }
                    await user.save();
                    return done(null, user);
                }
            }
            
            // Create new user with better username
            const displayName = profile.displayName || `User ${profile.id.slice(-6)}`;
            const username = displayName.replace(/\s+/g, '_').toLowerCase();
            
            user = new User({
                username: username,
                linkedinId: profile.id,
                email: email || `linkedin_${profile.id}@example.com`,
                displayName: displayName,
                profilePicture: profile.photos[0]?.value
            });
            
            await user.save();
            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
    }));
}

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});



app.use((req, res, next) => {
  res.locals.currUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.linkedinEnabled = !!(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET);
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
app.use("/", bookingRouter);

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
