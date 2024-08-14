const Restaurant = require("../models/Restaurant");
const Menu = require("../models/Menu");
const Cart = require("../models/cartModel");
const mongoose = require("mongoose")
const multer = require('multer');
const path = require('path');


const UPLOAD_PATH = 'uploads/';
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_PATH);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
}).single('image');


exports.createRestaurant = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }

    const { name, cuisineType, address, rating, openingHours } = req.body;

    if (!name || !cuisineType || !address || !rating || !openingHours) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const restaurant = new Restaurant({
      name,
      cuisineType,
      address,
      rating: parseFloat(rating),
      openingHours,
      image: `/uploads/${req.file.filename}`
    });

    await restaurant.save();

    res.status(201).json({ success: true, message: 'Restaurant created successfully', restaurant });
  } catch (error) {
    console.error('Error creating restaurant:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


exports.getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({});
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) 
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateRestaurant = async (req, res) => {
  try {
    let updateData = req.body;
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedRestaurant) 
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    res.json(updatedRestaurant);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
    if (!restaurant) 
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    res.json({ success: true, message: 'Restaurant deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Menu operations
exports.getAllMenuItems = async (req, res) => {
  try {
    const menuItems = await Menu.find({});
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createMenuItem = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }

    const { name, description, price, category } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const menuItem = {
      name,
      description,
      price: parseFloat(price),
      category,
      image: `/uploads/${req.file.filename}`
    };

    // Get the restaurant ID from req.params
    const restaurantId = req.params.restaurantId;
    console.log('Received restaurant ID:', restaurantId);

    // Verify the ID format
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      console.log('Invalid restaurant ID format:', restaurantId);
      return res.status(400).json({ success: false, message: 'Invalid restaurant ID' });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      console.log('Restaurant not found:', restaurantId);
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    restaurant.menu.push(menuItem);
    await restaurant.save();

    res.status(201).json({ success: true, message: 'Menu item created successfully', menuItem });
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};




exports.getMenuItem = async (req, res) => {
  try {
    const menuItem = await Menu.findById(req.params.menuId);
    if (!menuItem) 
        return res.status(404).json({ success: false, message: 'Menu item not found' });
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateMenuItem = async (req, res) => {
  try {
    let updateData = req.body;
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const updatedMenuItem = await Menu.findByIdAndUpdate(req.params.menuId, updateData, { new: true });
    if (!updatedMenuItem) 
        return res.status(404).json({ success: false, message: 'Menu item not found' });
    res.json(updatedMenuItem);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await Menu.findByIdAndDelete(req.params.menuId);
    if (!menuItem) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }
    res.json({ success: true, message: 'Menu item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Cart operations
exports.addToCart = async (req, res) => {
  try {
    const { userId, item } = req.body;
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }
    const existingItem = cart.items.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.items.push({ ...item, quantity: 1 });
    }
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};