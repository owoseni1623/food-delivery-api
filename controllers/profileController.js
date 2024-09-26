const User = require("../models/User");
const Profile = require("../models/Profile");
const Order = require("../models/Order");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage }).single('image');

// Update profile function
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
      if (address) profile.address = address; // Store address as a string
      if (email) profile.email = email;
      
      if (imagePath) {
        // Remove old image if it exists
        if (profile.image) {
          const oldImagePath = path.join(__dirname, '..', profile.image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        profile.image = imagePath;
      }
      
      await profile.save();
      
      // Update user model
      const updateData = {
        firstName,
        lastName,
        email,
        phone,
        address
      };
      
      if (imagePath) {
        updateData.profileImage = imagePath;
      }
      
      await User.findByIdAndUpdate(user._id, updateData, { new: true, runValidators: true });
      
      const updatedProfile = await Profile.findOne({ userId: user._id });
      
      res.json({
        success: true,
        profile: updatedProfile.getPublicProfile(),
        message: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  });
};

// Get profile function
const getProfile = async (req, res) => {
  try {
    const user = req.user;
    let profile = await Profile.findOne({ userId: user._id });
    
    if (!profile) {
      profile = new Profile({
        userId: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        image: user.profileImage
      });
      await profile.save();
    }
    
    if (!profile.image && user.profileImage) {
      profile.image = user.profileImage;
      await profile.save();
    }
    
    res.json({
      success: true,
      profile: profile.getPublicProfile()
    });
  } catch (error) {
    console.error("Error in getProfile:", error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get order history function
const getOrderHistory = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.error("Error in getOrderHistory:", error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = { updateProfile, getProfile, getOrderHistory };