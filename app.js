require("dotenv").config;

var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var flash = require("connect-flash");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var methodOverride = require("method-override");
var Restaurant = require("./models/restaurant");
var Comment = require("./models/comment");
var User = require("./models/user");
var url = process.env.DATABASEURL || "mongodb://localhost/fayce_value";

// requiring routes
var restaurantRoutes = require("./routes/restaurants");
var commentRoutes = require("./routes/comments");
var indexRoutes = require("./routes/index");

mongoose.set("useNewUrlParser", true);
mongoose.set("useUnifiedTopology", true);
mongoose.set("useFindAndModify", false);
mongoose.connect(url);
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require("moment");

// passport configuration
app.use(
  require("express-session")({
    secret: "Secret",
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// middleware to include currentUser on all templates
app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.use(indexRoutes);
app.use(restaurantRoutes);
app.use(commentRoutes);

app.listen(process.env.PORT || 3000, function() {
  console.log("FAYCEValue server hosted on port 3000");
});
