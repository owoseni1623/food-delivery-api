const User = require("../models/User");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const transporter = require('../config/nodemailer');
const { v4: uuidv4 } = require('uuid');

const sendAlert = (message) => {
  console.log('ALERT:', message);
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
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification',
      text: `Please verify your email by clicking the link: ${verificationUrl}`
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Verification email sent successfully');
      sendAlert(`Verification email sent to: ${email}`);
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      sendAlert(`Error sending verification email to: ${email}. Error: ${emailError.message}`);
    }

    res.status(201).json({
      success: true,
      message: "User registered successfully. If you don't receive a verification email, please contact support.",
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
    res.status(200).json({
      success: true,
      message: "Login successful",
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
      updateFields.avatar = `/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateFields, { new: true }).select('-password');
    if (!user) {
      sendAlert(`Update attempt for non-existent user ID: ${req.user.id}`);
      return res.status(404).json({ success: false, message: "User not found" });
    }
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
    res.status(200).json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error('Error during email verification:', error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: "Refresh token is required" });
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ success: false, message: "Invalid refresh token" });
      }

      const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
      res.json({ success: true, token: accessToken });
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

const mergeCart = async (req, res) => {
  try {
    const { localCart } = req.body;
    const userId = req.user.id;

    console.log('Merging cart for user:', userId);
    console.log('Local cart:', localCart);

    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Initialize cartData if it doesn't exist
    if (!user.cartData) {
      user.cartData = [];
    }

    localCart.forEach(localItem => {
      const existingItemIndex = user.cartData.findIndex(item => item.productId.toString() === localItem.id.toString());
      if (existingItemIndex > -1) {
        // Update existing item
        user.cartData[existingItemIndex].quantity += localItem.quantity;
      } else {
        // Add new item
        user.cartData.push({
          productId: localItem.id,
          name: localItem.name,
          price: localItem.price,
          quantity: localItem.quantity,
          image: localItem.image
        });
      }
    });

    await user.save();

    console.log('Cart merged successfully. Updated cart:', user.cartData);

    res.status(200).json({ 
      success: true, 
      message: "Cart merged successfully", 
      cartData: user.cartData 
    });
  } catch (error) {
    console.error('Error merging cart:', error);
    res.status(500).json({ 
      success: false, 
      message: "An error occurred while merging the cart", 
      error: error.message 
    });
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