const User = require('../models/User');

const cartController = {
  addToCart: async (req, res) => {
    try {
      const { id, name, price, image, quantity } = req.body;
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      const existingItemIndex = user.cartData.findIndex(item => item.id === id);

      if (existingItemIndex > -1) {
        user.cartData[existingItemIndex].quantity += quantity;
      } else {
        user.cartData.push({ id, name, price, image, quantity });
      }

      await user.save();
      res.json({ success: true, cartData: user.cartData });
    } catch (error) {
      console.error('Error adding to cart:', error);
      res.status(500).json({ success: false, message: "Error adding to cart", error: error.message });
    }
  },

  removeFromCart: async (req, res) => {
    try {
      const { itemId } = req.body;
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      user.cartData = user.cartData.filter(item => item.id !== itemId);
      await user.save();

      res.json({ success: true, cartData: user.cartData });
    } catch (error) {
      console.error('Error removing from cart:', error);
      res.status(500).json({ success: false, message: "Error removing from cart", error: error.message });
    }
  },

  getCart: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      res.json({ success: true, cartData: user.cartData });
    } catch (error) {
      console.error('Error fetching cart:', error);
      res.status(500).json({ success: false, message: "Error fetching cart", error: error.message });
    }
  },

  updateQuantity: async (req, res) => {
    try {
      const { itemId, change } = req.body;
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      const itemIndex = user.cartData.findIndex(item => item.id === itemId);

      if (itemIndex === -1) {
        return res.status(404).json({ success: false, message: "Item not found in cart" });
      }

      user.cartData[itemIndex].quantity += change;

      if (user.cartData[itemIndex].quantity <= 0) {
        user.cartData.splice(itemIndex, 1);
      }

      await user.save();
      res.json({ success: true, cartData: user.cartData });
    } catch (error) {
      console.error('Error updating quantity:', error);
      res.status(500).json({ success: false, message: "Error updating quantity", error: error.message });
    }
  },

  clearCart: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      user.cartData = [];
      await user.save();

      res.json({ success: true, message: "Cart cleared successfully" });
    } catch (error) {
      console.error('Error clearing cart:', error);
      res.status(500).json({ success: false, message: "Error clearing cart", error: error.message });
    }
  },

  mergeCart: async (req, res) => {
    try {
      const { localCart } = req.body;
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      for (const localItem of localCart) {
        const existingItemIndex = user.cartData.findIndex(item => item.id === localItem.id);
        if (existingItemIndex > -1) {
          user.cartData[existingItemIndex].quantity += localItem.quantity;
        } else {
          user.cartData.push(localItem);
        }
      }

      await user.save();
      res.json({ success: true, cartData: user.cartData });
    } catch (error) {
      console.error('Error merging cart:', error);
      res.status(500).json({ success: false, message: "Error merging cart", error: error.message });
    }
  },

  // New method to sync cart with localStorage
  syncCart: async (req, res) => {
    try {
      const { localCart } = req.body;
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      // Merge localCart with database cart
      const mergedCart = [...user.cartData];
      for (const localItem of localCart) {
        const existingItemIndex = mergedCart.findIndex(item => item.id === localItem.id);
        if (existingItemIndex > -1) {
          mergedCart[existingItemIndex].quantity = Math.max(mergedCart[existingItemIndex].quantity, localItem.quantity);
        } else {
          mergedCart.push(localItem);
        }
      }

      user.cartData = mergedCart;
      await user.save();

      res.json({ success: true, cartData: user.cartData });
    } catch (error) {
      console.error('Error syncing cart:', error);
      res.status(500).json({ success: false, message: "Error syncing cart", error: error.message });
    }
  }
};

module.exports = cartController;