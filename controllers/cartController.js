// const User = require("../models/User");

// const getCart = async (req, res) => {
//   try {
//     const userId = req.user._id; // Use authenticated user's id

//     if (!userId) {
//       return res.status(400).json({ success: false, message: "Missing userId" });
//     }

//     let user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     res.json({ success: true, cartData: user.cartData });
//   } catch (error) {
//     console.error("Error in getCart:", error);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };

// const updateCart = async (req, res) => {
//   try {
//     const userId = req.user._id; // Use authenticated user's id
//     const { cart } = req.body; // Get cart data from request body

//     if (!userId || !cart) {
//       return res.status(400).json({ success: false, message: "Missing cart data" });
//     }

//     let user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     user.cartData = cart;
//     await user.save();

//     res.json({ success: true, message: "Cart updated successfully", cartData: user.cartData });
//   } catch (error) {
//     console.error("Error in updateCart:", error);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };

// module.exports = { getCart, updateCart };


// const User = require("../models/User");

// const getCart = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     if (!userId) {
//       return res.status(400).json({ success: false, message: "Missing userId" });
//     }

//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     res.json({ success: true, cartData: user.cartData });
//   } catch (error) {
//     console.error("Error in getCart:", error);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };


// const updateCart = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { cart } = req.body;

//     if (!userId || !cart) {
//       return res.status(400).json({ success: false, message: "Missing cart data" });
//     }

//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     user.cartData = cart;
//     user.total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
//     await user.save();

//     res.json({ success: true, message: "Cart updated successfully", cartData: user.cartData, total: user.total });
//   } catch (error) {
//     console.error("Error in updateCart:", error);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };

// const addToCart = async (req, res) => {
//   try {

//     console.log('Request Body:', req.body); // Debugging line
//     console.log('User ID:', req.user.id); 
//     const userId = req.user.id;
//     const { itemId } = req.body;

//     if (!userId || !itemId) {
//       return res.status(400).json({ success: false, message: "Missing userId or itemId" });
//     }

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     // Initialize cartData if it doesn't exist
//     if (!user.cartData) {
//       user.cartData = {};
//     }

//     // Add item to cart
//     if (!user.cartData[itemId]) {
//       user.cartData[itemId] = 1;
//     } else {
//       user.cartData[itemId] += 1;
//     }

//     await user.save();

//     res.json({ success: true, message: "Added to cart", cartData: user.cartData });
//   } catch (error) {
//     console.error("Error in addToCart:", error);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };

// const addToCart = async (req, res) => {
//   try {
//     const userId = req.user._id;  // Ensure that req.user contains _id
//     const { itemId } = req.body;

//     if (!userId || !itemId) {
//       return res.status(400).json({ success: false, message: "Missing userId or itemId" });
//     }

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     if (!user.cartData) {
//       user.cartData = {};
//     }

//     if (!user.cartData[itemId]) {
//       user.cartData[itemId] = 1;
//     } else {
//       user.cartData[itemId] += 1;
//     }

//     await user.save();

//     res.json({ success: true, message: "Added to cart", cartData: user.cartData });
//   } catch (error) {
//     console.error("Error in addToCart:", error);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };



// module.exports = { getCart, updateCart, addToCart };



// controllers/cartController.js
const User = require('../models/User');

const addToCart = async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    const userId = req.user.id;
    const { itemId, item, phone } = req.body;

    if (!itemId || !item || !phone) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update user's phone if it's not set
    if (!user.phone) {
      user.phone = phone;
    }

    let cartData = user.cartData || [];

    const existingItemIndex = cartData.findIndex(cartItem => cartItem.id === itemId);
    if (existingItemIndex > -1) {
      cartData[existingItemIndex].quantity += 1;
    } else {
      // Ensure the image URL is correctly formatted and added
      const newItem = {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        image: item.image.startsWith('/') ? item.image : `/uploads/${item.image}`
      };
      console.log('Adding new item to cart:', newItem);
      cartData.push(newItem);
    }

    user.cartData = cartData;
    await user.save();

    console.log('Updated cart data:', user.cartData);
    res.json({ success: true, cartData: user.cartData });
  } catch (error) {
    console.error('Error in addToCart:', error);
    res.status(500).json({ success: false, message: "Error adding to cart", error: error.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.body;

    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let cartData = user.cartData || [];

    const itemIndex = cartData.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
      if (cartData[itemIndex].quantity > 1) {
        cartData[itemIndex].quantity -= 1;
      } else {
        cartData.splice(itemIndex, 1);
      }
    }

    user.cartData = cartData;
    await user.save();

    res.json({ success: true, cartData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error removing from cart" });
  }
};

const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let cartData = user.cartData || [];
    console.log('Cart data from database:', JSON.stringify(cartData, null, 2));
    res.json({ success: true, cartData });
  } catch (error) {
    console.error('Error in getCart:', error);
    res.status(500).json({ success: false, message: "Error fetching cart" });
  }
};

module.exports = { addToCart, removeFromCart, getCart };