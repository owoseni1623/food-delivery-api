const Menu = require('../models/Menu');
const Order = require('../models/Order');
const crypto = require('crypto');

exports.getAdminDashboard = async (req, res) => {
  try {
    const menuItems = await Menu.find();
    const orders = await Order.find().populate('items.menuItem');
    res.render('admin/dashboard', { menuItems, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addMenuItem = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    const newMenuItem = new Menu({ name, description, price, category });
    await newMenuItem.save();
    res.status(201).json(newMenuItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.editMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category } = req.body;
    const updatedMenuItem = await Menu.findByIdAndUpdate(id, 
      { name, description, price, category }, 
      { new: true }
    );
    res.json(updatedMenuItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    await Menu.findByIdAndDelete(id);
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('items.menuItem');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(id, { status }, { new: true });
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.generateTrackingNumber = async (req, res) => {
  try {
    const { id } = req.params;
    const trackingNumber = crypto.randomBytes(8).toString('hex').toUpperCase();
    const updatedOrder = await Order.findByIdAndUpdate(id, { trackingNumber }, { new: true });
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};