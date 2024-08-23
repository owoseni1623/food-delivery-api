const User = require('../models/User');

// Utility function for alerts
const sendAlert = (message, isDev) => {
  if (isDev) {
    console.log('DEV ALERT:', message);
  } else {
    console.log('PROD ALERT:', message);
    // Sentry.captureMessage(`PROD ALERT: ${message}`);
  }
};


exports.addToCart = async (req, res) => {
  const { productId, quantity, name, price, image } = req.body;
  const isDev = process.env.NODE_ENV === 'development';

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      sendAlert('User not found', isDev);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const existingItemIndex = user.cartData.findIndex(item => item.id === productId);
    let imageUrl = image;

    // If the image is not a full URL, construct it
    if (image && !image.startsWith('http')) {
      const apiUrl = `${req.protocol}://${req.get('host')}`;
      imageUrl = `${apiUrl}/uploads/${image.split('/').pop()}`;
    }

    if (existingItemIndex > -1) {
      user.cartData[existingItemIndex].quantity += quantity;
    } else {
      user.cartData.push({ id: productId, name, price, quantity, image: imageUrl });
    }

    await user.save();
    sendAlert(`Added to cart: ${name}`, isDev);
    res.status(200).json({ success: true, message: "Product added to cart", cartData: user.cartData });
  } catch (error) {
    sendAlert(`Error adding to cart: ${error.message}`, isDev);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

exports.removeFromCart = async (req, res) => {
  const isDev = process.env.NODE_ENV === 'development';
  try {
    const userId = req.user.id;
    const { itemId } = req.body;
    let user = await User.findById(userId);
    if (!user) {
      sendAlert('User not found', isDev);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const itemIndex = user.cartData.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
      user.cartData.splice(itemIndex, 1);
      await user.save();
      sendAlert(`Removed item from cart: ${itemId}`, isDev);
      res.json({ success: true, cartData: user.cartData });
    } else {
      sendAlert(`Item not found in cart: ${itemId}`, isDev);
      return res.status(404).json({ success: false, message: "Item not found in cart" });
    }
  } catch (error) {
    sendAlert(`Error in removeFromCart: ${error.message}`, isDev);
    res.status(500).json({ success: false, message: "Error removing from cart", error: error.message });
  }
};

exports.getCart = async (req, res) => {
  const isDev = process.env.NODE_ENV === 'development';
  try {
    const userId = req.user.id;
    let user = await User.findById(userId);
    if (!user) {
      sendAlert('User not found', isDev);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    sendAlert(`Cart data retrieved: ${JSON.stringify(user.cartData)}`, isDev);
    res.json({ success: true, cartData: user.cartData });
  } catch (error) {
    sendAlert(`Error in getCart: ${error.message}`, isDev);
    res.status(500).json({ success: false, message: "Error fetching cart", error: error.message });
  }
};

exports.updateQuantity = async (req, res) => {
  const { itemId, change } = req.body;
  const isDev = process.env.NODE_ENV === 'development';

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      sendAlert('User not found', isDev);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const itemIndex = user.cartData.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
      user.cartData[itemIndex].quantity += change;
      if (user.cartData[itemIndex].quantity <= 0) {
        user.cartData.splice(itemIndex, 1);
      }
      await user.save();
      sendAlert(`Cart updated: ${JSON.stringify(user.cartData)}`, isDev);
      res.json({ success: true, cartData: user.cartData });
    } else {
      sendAlert(`Item not found in cart: ${itemId}`, isDev);
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }
  } catch (error) {
    sendAlert(`Error in updateQuantity: ${error.message}`, isDev);
    res.status(500).json({ success: false, message: 'Error updating cart', error: error.message });
  }
};

exports.clearCart = async (req, res) => {
  const isDev = process.env.NODE_ENV === 'development';
  try {
    const userId = req.user.id;
    let user = await User.findById(userId);
    if (!user) {
      sendAlert('User not found', isDev);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.cartData = [];
    await user.save();
    sendAlert(`Cart cleared for user: ${userId}`, isDev);
    res.json({ success: true, message: "Cart cleared successfully" });
  } catch (error) {
    sendAlert(`Error in clearCart: ${error.message}`, isDev);
    res.status(500).json({ success: false, message: "Error clearing cart", error: error.message });
  }
};