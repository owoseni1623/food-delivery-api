const User = require("../models/User");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const transporter = require('../config/nodemailer');
const { v4: uuidv4 } = require('uuid');

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

exports.registerUser = async (req, res) => {
  console.log("Received registration data:", req.body);
  
  const {
    firstName,
    lastName,
    password,
    email,
    phone,
    address,
  } = req.body;

  try {
    if (!firstName || !lastName || !password || !email || !phone) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
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
      isVerified: false,
    });
    
    await newUser.save();

    const token = createToken(newUser._id);

    const verificationUrl = `${process.env.FRONTEND_URL}/api/email/verify/${verificationToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification',
      text: `Please verify your email by clicking the link: ${verificationUrl}`
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      success: true,
      message: "User registered successfully. Please check your email to verify your account.",
      token
    });

  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(401).json({ success: false, message: "Please verify your email before logging in" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
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
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateUserProfile = async (req, res) => {
  const userId = req.user.id;
  const { firstName, lastName, email, phone, street, city, state, country } = req.body;

  try {
    const updatedData = { 
      firstName, 
      lastName, 
      email, 
      phone, 
      address: { 
        street: street || '', 
        city: city || '', 
        state: state || '', 
        country: country || '' 
      }
    };

    Object.keys(updatedData).forEach(key => 
      (updatedData[key] === undefined) && delete updatedData[key]
    );

    if (updatedData.address) {
      Object.keys(updatedData.address).forEach(key => 
        (updatedData.address[key] === undefined) && delete updatedData.address[key]
      );
    }

    if (req.file) {
      updatedData.avatar = req.file.path;
    }

    const user = await User.findByIdAndUpdate(userId, updatedData, { new: true, runValidators: true })
      .select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};