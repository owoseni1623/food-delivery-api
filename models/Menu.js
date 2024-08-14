const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  rating: { type: Number, default: 3.5 },
});

module.exports = mongoose.model('Menu', menuSchema);