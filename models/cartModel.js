// const mongoose = require("mongoose");

// const cartItemSchema = new mongoose.Schema({
//   menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
//   quantity: { type: Number, required: true, min: 1 },
//   name: String,
//   description: String,
//   image: String,
//   price: Number
// });

// const cartSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   items: [cartItemSchema],
//   total: { type: Number, required: true, default: 0 }
// }, { timestamps: true });

// module.exports = mongoose.model('Cart', cartSchema);