const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String
  },
  role: {
    type: String,
    default: "client"
  },
  cartData: {
    type: [{
      id: String,
      name: String,
      price: Number,
      quantity: Number,
      image: String,
    }],
    default: []
  },
  orderHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String
  },
  verificationTokenExpires: {
    type: Date
  },
  avatar: {
    type: String
  }
}, {minimize: false});

const User = mongoose.model("User", userSchema);
module.exports = User;