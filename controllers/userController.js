// const User = require("../models/User");
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
// const transporter = require('../config/nodemailer');
// const { v4: uuidv4 } = require('uuid');

// const createToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
// };

// exports.registerUser = async (req, res) => {
//   console.log("Received registration data:", req.body);
  
//   const { firstName, lastName, password, email, phone, address } = req.body;

//   try {
//     if (!firstName || !lastName || !password || !email || !phone) {
//       return res.status(400).json({ success: false, message: "Missing required fields" });
//     }

//     if (password.length < 8) {
//       return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
//     }

//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ success: false, message: "User already exists" });
//     }

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);
    
//     const verificationToken = uuidv4();

//     const newUser = new User({
//       firstName,
//       lastName,
//       email,
//       phone,
//       address,
//       password: hashedPassword,
//       verificationToken,
//       verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
//       isVerified: false,
//     });
    
//     await newUser.save();

//     const token = createToken(newUser._id);

//     const verificationUrl = `${process.env.FRONTEND_URL}/api/email/verify/${verificationToken}`;
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: 'Email Verification',
//       text: `Please verify your email by clicking the link: ${verificationUrl}`
//     };

//     await transporter.sendMail(mailOptions);

//     res.status(201).json({
//       success: true,
//       message: "User registered successfully. Please check your email to verify your account.",
//       token
//     });
//   } catch (error) {
//     console.error('Error during registration:', error);
//     let errorMessage = "Server Error";
//     if (error.name === 'ValidationError') {
//       errorMessage = Object.values(error.errors).map(val => val.message).join(', ');
//     } else if (error.code === 11000) {
//       errorMessage = "Email already exists";
//     }
//     res.status(500).json({ success: false, message: errorMessage, error: error.message });
//   }
// };

// exports.loginUser = async (req, res) => {
//   // Implement login logic here
//   res.status(501).json({ message: "Login functionality not implemented yet" });
// };

// exports.getUserProfile = async (req, res) => {
//   // Implement get user profile logic here
//   res.status(501).json({ message: "Get user profile functionality not implemented yet" });
// };

// exports.updateUserProfile = async (req, res) => {
//   // Implement update user profile logic here
//   res.status(501).json({ message: "Update user profile functionality not implemented yet" });
// };




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
  console.log('Verification URL:', verificationUrl);
  console.log('Sending email to:', email);
  
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
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification',
      text: `Please verify your email by clicking the link: ${verificationUrl}`
    };
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully');
    res.status(201).json({
      success: true,
      message: "User registered successfully. Please check your email to verify your account.",
      token
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
    console.error('Error during registration:', error);
    let errorMessage = "Server Error";
    if (error.name === 'ValidationError') {
      errorMessage = Object.values(error.errors).map(val => val.message).join(', ');
    } else if (error.code === 11000) {
      errorMessage = "Email already exists";
    }
    res.status(500).json({ success: false, message: errorMessage, error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ success: false, message: "Please verify your email before logging in" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
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
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
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
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, message: "Profile updated successfully", user });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};