// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema({
//   firstName: { type: String, required: true },
//   lastName: { type: String, required: true },
//   phone: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   role: { type: String, enum: ["admin", "client"], default: "client" }
// }, { timestamps: true });

// module.exports = mongoose.models.User || mongoose.model('User', userSchema);



// const mongoose = require("mongoose");

// const cartItemSchema = new mongoose.Schema({
//   menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
//   quantity: { type: Number, required: true, min: 1 },
//   name: String,
//   price: Number
// }, { _id: false });

// const userSchema = new mongoose.Schema({
//   firstName: { type: String, required: true },
//   lastName: { type: String, required: true },
//   phone: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   cartData: {
//     items: [cartItemSchema],
//     total: { type: Number, default: 0 }
//   },
//   role: { type: String, enum: ["admin", "client"], default: "client" },
// }, { minimize: false });

// module.exports = mongoose.models.User || mongoose.model('User', userSchema);





// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   firstName: {
//     type: String,
//     required: true
//   },
//   lastName: {
//     type: String,
//     required: true
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   password: {
//     type: String,
//     required: true
//   },
//   phone: {
//     type: String
//   },
//   address: {
//     street: String,
//     city: String,
//     state: String,
//     country: String
//   },
//   role: {
//     type: String,
//     default: "client"
//   },
//   cartData: {
//     type: Array,
//     default: [{
//       id: String,
//       name: String,
//       price: Number,
//       quantity: Number,
//     }]
//   },
//   orderHistory: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Order'
//   }],
//   isVerified: {
//     type: Boolean,
//     default: false
//   },
//   avatar: {
//     type: String
//   }
// }, {minimize: false});

// const User = mongoose.models.User || mongoose.model("User", userSchema);

// module.exports = User;


// models/User.js
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
    type: String
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