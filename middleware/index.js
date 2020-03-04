var Restaurant = require("../models/restaurant");
var Comment = require("../models/comment");
var middlewareObj = {};

middlewareObj.checkRestaurantOwnership = function(req, res, next) {
  if (req.isAuthenticated()) {
    Restaurant.findById(req.params.id, function(err, foundRestaurant) {
      if (err) {
        req.flash("error", "Restaurant not found.");
        res.redirect("back");
      } else {
        if (foundRestaurant.author.id.equals(req.user._id)) {
          next();
        } else {
          req.flash("error", "You do not have permission to do that.");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "Please log in.");
    res.redirect("back");
  }
};

middlewareObj.checkCommentOwnership = function checkCommentOwnership(
  req,
  res,
  next
) {
  if (req.isAuthenticated()) {
    Comment.findById(req.params.comment_id, function(err, foundComment) {
      if (err) {
        res.redirect("back");
      } else {
        if (foundComment.author.id.equals(req.user._id)) {
          next();
        } else {
          req.flash("error", "You do not have permission.");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "Please log in first!");
    res.redirect("back");
  }
};

middlewareObj.isLoggedIn = function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash("error", "Please log in first!");
    res.redirect("/login");
  }
};

module.exports = middlewareObj;
