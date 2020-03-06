var express = require("express");
var router = express.Router();
var Restaurant = require("../models/restaurant");
var middleware = require("../middleware");
var NodeGeocoder = require("node-geocoder");

var options = {
  provider: "google",
  httpAdapter: "https",
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};

var geocoder = NodeGeocoder(options);

// RESTAURANT INDEX ROUTE
router.get("/restaurants", function(req, res) {
  var noMatch = null;
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), "gi");
    // Get all restaurants from DB
    Restaurant.find({ name: regex }, function(err, allRestaurants) {
      if (err) {
        console.log(err);
      } else {
        if (allRestaurants.length < 1) {
          noMatch = "No restaurants match that query, please try again.";
        }
        res.render("restaurants/index", {
          restaurants: allRestaurants,
          noMatch: noMatch
        });
      }
    });
  } else {
    Restaurant.find({}, function(err, allRestaurants) {
      if (err) {
        console.log(err);
      } else {
        res.render("restaurants/index", {
          restaurants: allRestaurants,
          noMatch: noMatch
        });
      }
    });
  }
});

// RESTAURANT NEW ROUTE
router.get("/restaurants/new", middleware.isLoggedIn, function(req, res) {
  res.render("restaurants/new");
});

//CREATE - add new restaurant to DB
router.post("/restaurants", middleware.isLoggedIn, function(req, res) {
  // get data from form and add to restaurants array
  var name = req.body.name;
  var image = req.body.image;
  var cost = req.body.cost;
  var desc = req.body.description;
  var author = {
    id: req.user._id,
    username: req.user.username
  };
  geocoder.geocode(req.body.location, function(err, data) {
    if (err || !data.length) {
      req.flash("error", "Invalid address");
      return res.redirect("back");
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    var newRestaurant = {
      name: name,
      image: image,
      cost: cost,
      description: desc,
      author: author,
      location: location,
      lat: lat,
      lng: lng
    };
    // Create a new campground and save to DB
    Restaurant.create(newRestaurant, function(err, newlyCreated) {
      if (err) {
        console.log(err);
      } else {
        //redirect back to restaurants page
        console.log(newlyCreated);
        res.redirect("/restaurants");
      }
    });
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

// UPDATE RESTAURANTS ROUTE
router.put("/restaurants/:id", middleware.checkRestaurantOwnership, function(
  req,
  res
) {
  geocoder.geocode(req.body.location, function(err, data) {
    if (err || !data.length) {
      console.log(err.message);
      req.flash("error", "Invalid address");
      return res.redirect("back");
    }
    req.body.restaurant.lat = data[0].latitude;
    req.body.restaurant.lng = data[0].longitude;
    req.body.restaurant.location = data[0].formattedAddress;

    Restaurant.findByIdAndUpdate(req.params.id, req.body.restaurant, function(
      err,
      restaurant
    ) {
      if (err) {
        req.flash("error", err.message);
        res.redirect("back");
      } else {
        req.flash("success", "Successfully Updated!");
        res.redirect("/restaurants/" + restaurant._id);
      }
    });
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

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports = router;
