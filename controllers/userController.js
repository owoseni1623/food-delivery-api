const User = require("../models/User");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const transporter = require('../config/nodemailer');
const { v4: uuidv4 } = require('uuid');


const sendAlert = (message) => {
  if (process.env.NODE_ENV === 'production') {
    console.log('ALERT:', message);
  }
};

exports.registerUser = async (req, res) => {
  console.log("Received registration data:", req.body);

  const { firstName, lastName, password, email, phone, address } = req.body;
  try {
    if (!firstName || !lastName || !password || !email || !phone) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
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
      firstName,
      lastName,
      email,
      phone,
      address,
      password: hashedPassword,
      verificationToken,
      isVerified: true,
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
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email
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

exports.loginUser = async (req, res) => {
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
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    sendAlert(`Error during login: ${error.message}`);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }

};
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};


exports.getUserProfile = async (req, res) => {
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

exports.updateUserProfile = async (req, res) => {
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

exports.verifyEmail = async (req, res) => {
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