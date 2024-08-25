const express = require('express');
const { registerUser, loginUser, getUserProfile, updateUserProfile, verifyEmail } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken'); // Add this line
const User = require('../models/User'); // Add this line
const multer = require('multer');
const path = require('path');
const transporter = require('../config/nodemailer');


const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});
const upload = multer({ storage: storage });

// User routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, upload.single('avatar'), updateUserProfile);

// Email verification route
router.get('/verify-email/:token', verifyEmail);

// Test email route
router.get('/test-email', async (req, res) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to yourself for testing
      subject: "Test Email",
      text: "This is a test email from your application."
    });
    res.status(200).json({ message: "Test email sent successfully" });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ error: "Failed to send test email", details: error.message });
  }
});


router.post('/refresh-token', async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ success: false, message: "Token is required" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const newToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, token: newToken });
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
});

module.exports = router;
