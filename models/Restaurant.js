const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String },
  category: { type: String, required: true }
});

const RestaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cuisineType: { type: String, required: true },
  address: { type: String, required: true },
  rating: { type: Number, required: true },
  openingHours: { type: String, required: true },
  image: { type: String },
  menu: [MenuItemSchema]
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);