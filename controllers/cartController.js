const User = require('../models/User');

const sendAlert = (message, isDev) => {
  if (isDev) {
    console.log('DEV ALERT:', message);
  } else {
    console.log('PROD ALERT:', message);
  }
};

exports.getCart = async (req, res) => {
  const isDev = process.env.NODE_ENV === 'development';
  try {
    const user = await User.findById(req.user.id);
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

exports.addToCart = async (req, res) => {
  const { id, name, price, image, quantity } = req.body;
  const isDev = process.env.NODE_ENV === 'development';

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      sendAlert('User not found', isDev);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const existingItemIndex = user.cartData.findIndex(item => item.id === id);
    let imageUrl = image;

    if (image && !image.startsWith('http')) {
      const apiUrl = `${req.protocol}://${req.get('host')}`;
      imageUrl = `${apiUrl}/uploads/${image.split('/').pop()}`;
    }

    if (existingItemIndex > -1) {
      user.cartData[existingItemIndex].quantity += quantity;
    } else {
      user.cartData.push({ id, name, price, quantity, image: imageUrl });
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

exports.mergeCart = async (req, res) => {
  const { localCart } = req.body;
  const isDev = process.env.NODE_ENV === 'development';

  try {
    // Check if req.user exists and has an id property
    if (!req.user || !req.user.id) {
      sendAlert('User not authenticated', isDev);
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      sendAlert('User not found', isDev);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Ensure localCart is an array
    if (!Array.isArray(localCart)) {
      sendAlert('Invalid local cart data', isDev);
      return res.status(400).json({ success: false, message: "Invalid local cart data" });
    }

    // Merge the local cart with the user's cart
    localCart.forEach(localItem => {
      const existingItemIndex = user.cartData.findIndex(item => item.id === localItem.id);
      if (existingItemIndex > -1) {
        user.cartData[existingItemIndex].quantity += localItem.quantity;
      } else {
        user.cartData.push(localItem);
      }
    });

    await user.save();
    sendAlert(`Cart merged for user: ${req.user.id}`, isDev);
    res.json({ success: true, cartData: user.cartData });
  } catch (error) {
    sendAlert(`Error in mergeCart: ${error.message}`, isDev);
    res.status(500).json({ success: false, message: "Error merging cart", error: error.message });
  }
};