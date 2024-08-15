const User = require('../models/User');

exports.addToCart = async (req, res) => {
  try {
    console.log('addToCart called for user:', req.user.id);
    console.log('Received request body:', req.body);
    const userId = req.user.id;
    const { itemId, item, phone } = req.body;
    if (!itemId || !item || !phone) {
      console.log('Missing required fields:', { itemId, item, phone });
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    let user = await User.findById(userId);
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ success: false, message: "User not found" });
    }
    // Update user's phone if it's not set
    if (!user.phone) {
      user.phone = phone;
      console.log('Updated user phone:', phone);
    }
    let cartData = user.cartData || [];
    const existingItemIndex = cartData.findIndex(cartItem => cartItem.id === itemId);
    if (existingItemIndex > -1) {
      cartData[existingItemIndex].quantity += 1;
      console.log('Increased quantity for existing item:', itemId);
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
    console.log('Updated cart data:', JSON.stringify(user.cartData, null, 2));
    res.json({ success: true, cartData: user.cartData });
  } catch (error) {
    console.error('Error in addToCart:', error);
    res.status(500).json({ success: false, message: "Error adding to cart", error: error.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    console.log('removeFromCart called for user:', req.user.id);
    const userId = req.user.id;
    const { itemId } = req.body;
    console.log('Removing item:', itemId);
    let user = await User.findById(userId);
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ success: false, message: "User not found" });
    }
    let cartData = user.cartData || [];
    const itemIndex = cartData.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
      if (cartData[itemIndex].quantity > 1) {
        cartData[itemIndex].quantity -= 1;
        console.log('Decreased quantity for item:', itemId);
      } else {
        cartData.splice(itemIndex, 1);
        console.log('Removed item from cart:', itemId);
      }
    } else {
      console.log('Item not found in cart:', itemId);
    }
    user.cartData = cartData;
    await user.save();
    console.log('Updated cart data:', JSON.stringify(cartData, null, 2));
    res.json({ success: true, cartData });
  } catch (error) {
    console.error('Error in removeFromCart:', error);
    res.status(500).json({ success: false, message: "Error removing from cart", error: error.message });
  }
};

exports.getCart = async (req, res) => {
  try {
    console.log('getCart called for user:', req.user.id);
    const userId = req.user.id;
    let user = await User.findById(userId);
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ success: false, message: "User not found" });
    }
    let cartData = user.cartData || [];
    console.log('Cart data from database:', JSON.stringify(cartData, null, 2));
    res.json({ success: true, cartData });
  } catch (error) {
    console.error('Error in getCart:', error);
    res.status(500).json({ success: false, message: "Error fetching cart", error: error.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    console.log('clearCart called for user:', req.user.id);
    const userId = req.user.id;
    let user = await User.findById(userId);
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ success: false, message: "User not found" });
    }
    user.cartData = [];
    await user.save();
    console.log('Cart cleared for user:', userId);
    res.json({ success: true, message: "Cart cleared successfully" });
  } catch (error) {
    console.error('Error in clearCart:', error);
    res.status(500).json({ success: false, message: "Error clearing cart", error: error.message });
  }
};