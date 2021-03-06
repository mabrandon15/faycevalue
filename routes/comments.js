var express = require("express");
var router = express.Router();
var Restaurant = require("../models/restaurant");
var Comment = require("../models/comment");
var middleware = require("../middleware");

// COMMENT NEW ROUTE
router.get("/restaurants/:id/comments/new", middleware.isLoggedIn, function(
  req,
  res
) {
  Restaurant.findById(req.params.id, function(err, restaurant) {
    if (err) {
      console.log(err);
    } else {
      res.render("comments/new", { restaurant: restaurant });
    }
  });
});

// COMMENT CREATE ROUTE
router.post("/restaurants/:id/comments", middleware.isLoggedIn, function(
  req,
  res
) {
  Restaurant.findById(req.params.id, function(err, restaurant) {
    if (err) {
      console.log(err);
      res.redirect("/restaurants");
    } else {
      Comment.create(req.body.comment, function(err, comment) {
        if (err) {
          req.flash("error", "Something went wrong.");
          console.log(err);
        } else {
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          comment.save();
          restaurant.comments.push(comment);
          restaurant.save();
          console.log(comment);
          req.flash("success", "Successfully created comment.");
          res.redirect("/restaurants/" + restaurant._id);
        }
      });
    }
  });
});

// COMMENT EDIT ROUTE
router.get(
  "/restaurants/:id/comments/:comment_id/edit",
  middleware.checkCommentOwnership,
  function(req, res) {
    Comment.findById(req.params.comment_id, function(err, foundComment) {
      if (err) {
        res.redirect("back");
      } else {
        res.render("comments/edit", {
          restaurant_id: req.params.id,
          comment: foundComment
        });
      }
    });
  }
);

// COMMENT UPDATE ROUTE
router.put(
  "/restaurants/:id/comments/:comment_id",
  middleware.checkCommentOwnership,
  function(req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(
      err,
      updatedComment
    ) {
      if (err) {
        res.redirect("back");
      } else {
        res.redirect("/restaurants/" + req.params.id);
      }
    });
  }
);

// COMMENTS DESTROY ROUTE
router.delete(
  "/restaurants/:id/comments/:comment_id",
  middleware.checkCommentOwnership,
  function(req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function(err) {
      if (err) {
        res.redirect("back");
      } else {
        req.flash("success", "Successfully deleted comment.");
        res.redirect("/restaurants/" + req.params.id);
      }
    });
  }
);

module.exports = router;
