const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/profile', authMiddleware, userController.getUserProfile);
router.put('/profile', authMiddleware, upload.single('avatar'), userController.updateUserProfile);

module.exports = router;


// routes/userRoutes.js

// const express = require('express');
// const router = express.Router();
// const userController = require('../controllers/userController');
// const authMiddleware = require('../middleware/authMiddleware');
// const multer = require('multer');
// const path = require('path');

// // Configure multer for file upload
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/') // Make sure this directory exists
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname))
//   }
// });

// const upload = multer({ storage: storage });

// router.post('/register', userController.registerUser);
// router.post('/login', userController.loginUser);
// router.post('/send-verification', userController.sendVerificationCodes);
// router.get('/profile', authMiddleware, userController.getUserProfile);
// router.put('/profile', authMiddleware, upload.single('avatar'), userController.updateUserProfile);

// module.exports = router;



// userRoutes.js
// const express = require('express');
// const router = express.Router();
// const userController = require('../controllers/userController');
// const authMiddleware = require('../middleware/authMiddleware');
// const multer = require('multer');
// const path = require('path');

// // Configure multer for file upload
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/') // Make sure this directory exists
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname))
//   }
// });

// const upload = multer({ storage: storage });

// // User routes
// router.post('/register', userController.registerUser);
// router.post('/login', userController.loginUser);
// router.post('/send-verification-code', userController.sendVerificationCode);
// router.get('/profile', authMiddleware, userController.getUserProfile);
// router.put('/profile', authMiddleware, upload.single('avatar'), userController.updateUserProfile);

// // Add a catch-all route for debugging
// router.all('*', (req, res) => {
//   res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
// });

// module.exports = router;



// routes/userRoutes.js (or wherever your user routes are defined)
// const express = require('express');
// const router = express.Router();
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');
// const { sendVerificationEmail } = require('../config/emailService');
// const { generateToken } = require("../middleware/Auth");

// // Helper function to generate verification code
// const generateVerificationCode = () => {
//   return Math.floor(100000 + Math.random() * 900000).toString();
// };

// // Helper function to validate email
// const isValidEmail = (email) => {
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   return emailRegex.test(email);
// };

// // Route to handle sending verification codes
// router.post('/send-verification', async (req, res) => {
//   const { email } = req.body;

//   if (!email) {
//     return res.status(400).json({ success: false, message: 'Email is required' });
//   }

//   if (!isValidEmail(email)) {
//     return res.status(400).json({ success: false, message: 'Please enter a valid email' });
//   }

//   try {
//     const verificationCode = generateVerificationCode();
//     const emailSent = await sendVerificationEmail(email, verificationCode);

//     if (emailSent) {
//       // In a real application, you would save this verification code in the database
//       // associated with the user's email for later verification
//       return res.status(200).json({
//         success: true,
//         message: 'Verification code sent successfully',
//         emailSent: true
//       });
//     } else {
//       return res.status(500).json({ success: false, message: 'Failed to send verification code' });
//     }
//   } catch (error) {
//     console.error('Error in send-verification:', error);
//     return res.status(500).json({ success: false, message: 'An error occurred' });
//   }
// });

// // Route to handle user registration
// router.post('/register', async (req, res) => {
//   try {
//     const { firstName, lastName, email, password, phone, street, city, state, country } = req.body;

//     // Check if user already exists
//     let user = await User.findOne({ email });
//     if (user) {
//       return res.status(400).json({ success: false, message: 'User already exists' });
//     }

//     if (!isValidEmail(email)) {
//       return res.status(400).json({ success: false, message: 'Please enter a valid email' });
//     }

//     if (password.length < 8) {
//       return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
//     }

//     // Hash password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // Create new user
//     user = new User({
//       firstName,
//       lastName,
//       email,
//       password: hashedPassword,
//       phone,
//       address: { street, city, state, country },
//       isVerified: false // Set to false initially
//     });

//     await user.save();

//     // Generate verification code and send email
//     const verificationCode = generateVerificationCode();
//     const emailSent = await sendVerificationEmail(email, verificationCode);

//     if (emailSent) {
//       // Save verification code to user (you might want to hash this in a real application)
//       user.verificationCode = verificationCode;
//       user.verificationCodeExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
//       await user.save();

//       res.status(201).json({
//         success: true,
//         message: 'User registered successfully. Please check your email to verify your account.'
//       });
//     } else {
//       res.status(500).json({ success: false, message: 'Failed to send verification email' });
//     }
//   } catch (error) {
//     console.error('Error in register:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// });

// // Route to handle email verification
// router.post('/verify-email', async (req, res) => {
//   const { email, verificationCode } = req.body;

//   try {
//     const user = await User.findOne({ 
//       email, 
//       verificationCode,
//       verificationCodeExpires: { $gt: Date.now() }
//     });

//     if (!user) {
//       return res.status(400).json({ success: false, message: 'Invalid or expired verification code' });
//     }

//     user.isVerified = true;
//     user.verificationCode = undefined;
//     user.verificationCodeExpires = undefined;
//     await user.save();

//     res.json({ success: true, message: 'Email verified successfully' });
//   } catch (error) {
//     console.error('Error in email verification:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// });

// // Route to handle user login
// router.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Check if user exists
//     let user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ success: false, message: 'Invalid credentials' });
//     }

//     // Check if email is verified
//     if (!user.isVerified) {
//       return res.status(400).json({ success: false, message: 'Please verify your email before logging in' });
//     }

//     // Check password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ success: false, message: 'Invalid credentials' });
//     }

//     // Create and return JWT token
//     const token = generateToken(user);
//     res.json({
//       success: true,
//       token,
//       user: {
//         id: user._id,
//         email: user.email,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         phone: user.phone
//       }
//     });
//   } catch (error) {
//     console.error('Error in login:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// });

// module.exports = router;




// const express = require('express');
// const router = express.Router();
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');
// const emailService = require('../config/emailService');

// // Helper function to create JWT token
// const createToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
// };

// // Helper function to validate email
// const isValidEmail = (email) => {
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   return emailRegex.test(email);
// };

// // Route to handle user registration
// router.post('/register', async (req, res) => {
//   const { 
//     firstName, 
//     lastName, 
//     email, 
//     password, 
//     phone, 
//     street, 
//     city, 
//     state, 
//     country,
//     emailVerificationCode
//   } = req.body;

//   try {
//     // Check if user already exists
//     let existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ success: false, message: 'User already exists' });
//     }

//     // Validate email
//     if (!isValidEmail(email)) {
//       return res.status(400).json({ success: false, message: 'Please enter a valid email' });
//     }

//     // Validate password
//     if (password.length < 8) {
//       return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
//     }

//     // Verify email code
//     if (!emailVerificationCode) {
//       return res.status(400).json({ success: false, message: 'Email verification code is required' });
//     }

//     const isEmailCodeValid = await emailService.verifyEmailCode(email, emailVerificationCode);
//     if (!isEmailCodeValid) {
//       return res.status(400).json({ success: false, message: 'Invalid email verification code' });
//     }

//     // Hash password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // Create new user
//     const newUser = new User({
//       firstName,
//       lastName,
//       email,
//       password: hashedPassword,
//       phone,
//       address: { street, city, state, country },
//       isVerified: true // Set to true since we've verified email
//     });

//     await newUser.save();

//     // Generate token
//     const token = createToken(newUser._id);

//     res.status(201).json({
//       success: true,
//       message: 'User registered successfully',
//       token,
//       user: {
//         id: newUser._id,
//         email: newUser.email,
//         firstName: newUser.firstName,
//         lastName: newUser.lastName,
//         phone: newUser.phone
//       }
//     });
//   } catch (error) {
//     console.error('Error in register:', error);
//     res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// });

// // Route to handle user login
// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // Check if user exists
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ success: false, message: 'Invalid credentials' });
//     }

//     // Check password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ success: false, message: 'Invalid credentials' });
//     }

//     // Create and return JWT token
//     const token = createToken(user._id);
//     res.json({
//       success: true,
//       token,
//       user: {
//         id: user._id,
//         email: user.email,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         phone: user.phone
//       }
//     });
//   } catch (error) {
//     console.error('Error in login:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// });

// // Route to send email verification code
// router.post('/send-verification-code', async (req, res) => {
//   const { email } = req.body;

//   try {
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ success: false, message: "User already exists" });
//     }

//     if (!isValidEmail(email)) {
//       return res.status(400).json({ success: false, message: "Please enter a valid email" });
//     }

//     const emailCode = await emailService.sendVerificationEmail(email);

//     if (emailCode) {
//       res.status(200).json({ 
//         success: true, 
//         message: 'Verification code sent',
//         emailSent: true
//       });
//     } else {
//       res.status(500).json({ success: false, message: 'Failed to send verification code' });
//     }
//   } catch (error) {
//     console.error('Error sending verification code:', error);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// });

// module.exports = router;