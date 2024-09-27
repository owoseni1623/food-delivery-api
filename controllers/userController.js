const User = require("../models/User");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const emailService = require('../services/emailService');
const notificationService = require('../services/notificationService'); // New import

const sendAlert = (message, isDev = false) => {
  if (process.env.NODE_ENV === 'production' || isDev) {
    console.log('ALERT:', message);
  }
};

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const registerUser = async (req, res) => {
  console.log("Received registration data:", req.body);

  const { email, password, firstName, lastName, phone, address } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      sendAlert(`Registration attempt with existing email: ${email}`);
      return res.status(409).json({ success: false, message: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationToken = uuidv4();
    const newUser = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      address,
      verificationToken,
      isVerified: false,
    });

    await newUser.save();

    const token = createToken(newUser._id);

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    await emailService.sendVerificationEmail(email, firstName, verificationUrl);

    // Send registration email
    await emailService.sendRegistrationEmail(email, firstName);

    // Send welcome notification
    await notificationService.sendNotification(newUser._id, 'Welcome to our platform!', 'We\'re glad to have you on board.');

    res.status(201).json({
      success: true,
      message: "User registered successfully. Please check your email for verification and welcome messages.",
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName
      }
    });

  } catch (error) {
    console.error('Detailed error during registration:', error);
    sendAlert(`Error during registration: ${error.message}`);
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Email already exists" });
    }

    if (error.name === 'MongoNetworkError') {
      sendAlert('Database connection error during user registration');
      return res.status(500).json({ success: false, message: "Database connection error. Please try again later." });
    }

    res.status(500).json({ 
      success: false, 
      message: "An error occurred during registration", 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      sendAlert(`Login attempt with non-existent email: ${email}`);
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      sendAlert(`Failed login attempt for email: ${email}`);
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const token = createToken(user._id);

    // Send login notification email
    await emailService.sendLoginNotification(email, user.firstName);

    // Send login notification
    await notificationService.sendNotification(user._id, 'New login detected', `A new login was detected for your account on ${new Date().toLocaleString()}`);

    res.status(200).json({
      success: true,
      message: "Login successful. A notification has been sent to your email.",
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(error.response?.status || 500).json({ 
      success: false, 
      message: error.message || "An unexpected error occurred",
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      sendAlert(`Profile fetch attempt for non-existent user ID: ${req.user.id}`);
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    sendAlert(`Error fetching user profile: ${error.message}`);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, address } = req.body;
    const updateFields = {};
    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    if (phone) updateFields.phone = phone;
    if (address) updateFields.address = address;

    if (req.file) {
      updateFields.profileImage = `/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateFields, { new: true }).select('-password');
    if (!user) {
      sendAlert(`Update attempt for non-existent user ID: ${req.user.id}`);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Send profile update notification
    await notificationService.sendNotification(user._id, 'Profile Updated', 'Your profile information has been successfully updated.');

    res.status(200).json({ success: true, message: "Profile updated successfully", user });
  } catch (error) {
    console.error('Error updating user profile:', error);
    sendAlert(`Error updating user profile: ${error.message}`);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

const verifyEmail = async (req, res) => {
  const { token } = req.params;
  try {
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid verification token" });
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    // Send email verification success notification
    await notificationService.sendNotification(user._id, 'Email Verified', 'Your email has been successfully verified. Thank you!');

    res.status(200).json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error('Error during email verification:', error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    // Implement your refresh token logic here
    const newAccessToken = ""; // Generate new access token
    res.json({ success: true, token: newAccessToken });
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid refresh token" });
  }
};

const mergeCart = async (req, res) => {
  const { localCart } = req.body;
  const isDev = process.env.NODE_ENV === 'development';

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      sendAlert('User not found', isDev);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Initialize cartData if it doesn't exist
    if (!user.cartData) {
      user.cartData = [];
    }

    for (const localItem of localCart) {
      if (localItem && localItem.id) {
        const existingItemIndex = user.cartData.findIndex(item => item.id === localItem.id);
        if (existingItemIndex > -1) {
          user.cartData[existingItemIndex].quantity += localItem.quantity;
        } else {
          user.cartData.push({
            id: localItem.id,
            name: localItem.name,
            price: localItem.price,
            image: localItem.image,
            quantity: localItem.quantity
          });
        }
      } else {
        sendAlert(`Invalid item in localCart: ${JSON.stringify(localItem)}`, isDev);
      }
    }

    await user.save();
    sendAlert(`Cart merged for user: ${req.user.id}`, isDev);

    // Send cart update notification
    await notificationService.sendNotification(user._id, 'Cart Updated', 'Your shopping cart has been updated with items from your local cart.');

    res.json({ success: true, cartData: user.cartData });
  } catch (error) {
    sendAlert(`Error in mergeCart: ${error.message}`, isDev);
    res.status(500).json({ success: false, message: "Error merging cart", error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  verifyEmail,
  refreshToken,
  mergeCart
};