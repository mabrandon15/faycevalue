var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

// LANDING
router.get("/", function(req, res) {
  res.render("landing");
});

// REGISTER FORM ROUTE
router.get("/register", function(req, res) {
  res.render("register");
});

// REGISTER LOGIC
router.post("/register", function(req, res) {
  var newUser = new User({ username: req.body.username });
  if (req.body.adminCode === "allyoucaneat") {
    newUser.isAdmin = true;
  }
  User.register(newUser, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      req.flash("error", err.message);
      res.render("register");
    } else {
      passport.authenticate("local")(req, res, function() {
        req.flash("success", "Welcome, " + user.username);
        res.redirect("/restaurants");
      });
    }
  });
});

// LOGIN FORM ROUTE
router.get("/login", function(req, res) {
  res.render("login");
});

// LOGIN LOGIC ROUTE
router.post("/login", function(req, res) {
  passport.authenticate("local", {
    successRedirect: "/restaurants",
    failureRedirect: "/login",
    successFlash: "Welcome to FAYCE Value, " + req.body.username + "!",
    failureFlash: true
  })(req, res);
});

// LOGOUT ROUTE
router.get("/logout", function(req, res) {
  req.logout();
  req.flash("success", "Successfully logged out");
  res.redirect("/restaurants");
});

module.exports = router;
