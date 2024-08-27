const express = require('express');
const { registerUser, loginUser, getUserProfile, updateUserProfile, verifyEmail, refreshToken } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
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
router.post('/refresh-token', refreshToken);
router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, upload.single('avatar'), updateUserProfile);

// Email verification route
router.get('/verify-email/:token', verifyEmail);

// Test email route
router.get('/test-email', async (req, res) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "Test Email",
      text: "This is a test email from your application."
    });
    res.status(200).json({ message: "Test email sent successfully" });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ error: "Failed to send test email", details: error.message });
  }
});

module.exports = router;
