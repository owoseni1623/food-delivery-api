const Menu = require("../models/Menu");
const multer = require('multer');
const path = require('path');

const UPLOAD_PATH = 'uploads/';
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_PATH)
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
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
  },
}).single('image');

exports.getAllMenuItems = async (req, res) => {
  try {
    const menuItems = await Menu.find({});
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createMenuItem = async (req, res) => {
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No image file uploaded' });
      }
      const { name, description, price, category } = req.body;
      if (!name || !description || !price || !category) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }
      const menuItem = new Menu({
        name,
        description,
        price: parseFloat(price),
        image: req.file.filename,
        category
      });
      const newMenuItem = await menuItem.save();
      res.status(201).json({
        success: true,
        message: "Item Added",
        item: newMenuItem,
        imageUrl: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
      });
    } catch (error) {
      console.error('Error in createMenuItem:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  });
};

exports.getMenuItem = async (req, res) => {
  try {
    const menuItem = await Menu.findById(req.params.id);
    if (!menuItem)
      return res.status(404).json({ message: 'Menu item not found' });
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateMenuItem = async (req, res) => {
  try {
    const updatedMenuItem = await Menu.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedMenuItem)
      return res.status(404).json({ message: 'Menu item not found' });
    res.json(updatedMenuItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await Menu.findByIdAndDelete(req.params.id);
    if (!menuItem)
      return res.status(404).json({ message: 'Menu item not found' });
    res.json({ message: 'Menu item deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRestaurants = async (req, res) => {
  try {
    const menuItems = await Menu.find({});
    const restaurants = [{
      id: 'default-restaurant',
      name: 'Default Restaurant',
      menu: menuItems
    }];
    res.json(restaurants);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};