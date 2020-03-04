var express = require("express");
var router = express.Router();
var Restaurant = require("../models/restaurant");
var middleware = require("../middleware");

// RESTAURANT INDEX ROUTE
router.get("/restaurants", function(req, res) {
  Restaurant.find({}, function(err, allRestaurants) {
    if (err) {
      console.log(err);
    } else {
      res.render("restaurants/index", { restaurants: allRestaurants });
    }
  });
});

// RESTAURANT NEW ROUTE
router.get("/restaurants/new", middleware.isLoggedIn, function(req, res) {
  res.render("restaurants/new");
});

// RESTAURANT CREATE ROUTE
router.post("/restaurants", middleware.isLoggedIn, function(req, res) {
  var name = req.body.name;
  var image = req.body.image;
  var description = req.body.description;
  var author = {
    id: req.user._id,
    username: req.user.username
  };
  var newRestaurant = {
    name: name,
    image: image,
    description: description,
    author: author
  };
  Restaurant.create(newRestaurant, function(err, newlyCreated) {
    if (err) {
      console.log(err);
    } else {
      console.log(newlyCreated);
      req.flash("success", "Restaurant successfully added.");
      res.redirect("/restaurants");
    }
  });
});

// RESTAURANT SHOW ROUTE
router.get("/restaurants/:id", function(req, res) {
  Restaurant.findById(req.params.id)
    .populate("comments")
    .exec(function(err, foundRestaurant) {
      if (err) {
        console.log(err);
      } else {
        res.render("restaurants/show", { restaurant: foundRestaurant });
      }
    });
});

// RESTAURANT EDIT ROUTE

router.get(
  "/restaurants/:id/edit",
  middleware.checkRestaurantOwnership,
  function(req, res) {
    Restaurant.findById(req.params.id, function(err, foundRestaurant) {
      if (err) {
        console.log(err);
      } else {
        res.render("restaurants/edit", { restaurant: foundRestaurant });
      }
    });
  }
);

// RESTAURANT UPDATE ROUTE
router.put("/restaurants/:id", middleware.checkRestaurantOwnership, function(
  req,
  res
) {
  Restaurant.findByIdAndUpdate(req.params.id, req.body.restaurant, function(
    err,
    updatedRestaurant
  ) {
    if (err) {
      res.redirect("/restaurants");
    } else {
      res.redirect("/restaurants/" + req.params.id);
    }
  });
});

// RESTAURANT DESTROY ROUTE
router.delete("/restaurants/:id", middleware.checkRestaurantOwnership, function(
  req,
  res
) {
  Restaurant.findByIdAndRemove(req.params.id, function(err) {
    if (err) {
      res.redirect("/restaurants");
    } else {
      req.flash("success", "Successfully deleted restaurant.");
      res.redirect("/restaurants");
    }
  });
});

module.exports = router;
