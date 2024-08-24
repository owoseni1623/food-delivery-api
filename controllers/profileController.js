const User = require("../models/User");
const Profile = require("../models/Profile");
const Order = require("../models/Order");
const multer = require('multer');
const path = require('path');

// Set up multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage }).single('image');

const updateProfile = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      console.error("File upload error:", err);
      return res.status(400).json({ success: false, message: 'File upload error', error: err.message });
    }
    
    try {
      const user = req.user;
      const { firstName, lastName, phone, address, email } = req.body;
      let imagePath = req.file ? `/uploads/${req.file.filename}` : undefined;
      
      let profile = await Profile.findOne({ userId: user._id });
      
      if (!profile) {
        profile = new Profile({ userId: user._id });
      }
      
      // Update profile fields
      if (firstName) profile.firstName = firstName;
      if (lastName) profile.lastName = lastName;
      if (phone) profile.phone = phone;
      if (address) profile.address = address;
      if (email) profile.email = email;
      if (imagePath) profile.image = imagePath;
      
      await profile.save();
      
      const updatedProfile = await Profile.findOne({ userId: user._id });
      console.log("Updated profile before sending:", updatedProfile);
      
      res.json({
        success: true,
        profile: {
          ...updatedProfile.toObject(),
          image: updatedProfile.image ? `${req.protocol}://${req.get('host')}${updatedProfile.image}` : null
        },
        message: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  });
};

const getProfile = async (req, res) => {
  try {
    const user = req.user;
    let profile = await Profile.findOne({ userId: user._id });
    
    if (!profile) {
      profile = new Profile({ userId: user._id });
      await profile.save();
    }
    
    res.json({
      success: true,
      profile: {
        ...profile.toObject(),
        image: profile.image ? `${req.protocol}://${req.get('host')}${profile.image}` : null
      }
    });
  } catch (error) {
    console.error("Error in getProfile:", error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getOrderHistory = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.error("Error in getOrderHistory:", error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = { getProfile, updateProfile, getOrderHistory };