var mongoose = require("mongoose");

var restaurantSchema = new mongoose.Schema({
  name: String,
  image: String,
  description: String,
  cost: Number,
  location: String,
  lat: Number,
  lng: Number,
  createdAt: { type: Date, default: Date.now },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    }
  ],
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String
  }
});

module.exports = mongoose.model("Restaurant", restaurantSchema);
