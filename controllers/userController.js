const User = require("../models/User");
const Profile = require("../models/Profile");
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

const sendEmail = async (to, subject, htmlContent) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html: htmlContent
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to: ${to}`);
    sendAlert(`Email sent to: ${to}`);
  } catch (emailError) {
    console.error('Error sending email:', emailError);
    sendAlert(`Error sending email to: ${to}. Error: ${emailError.message}`);
    throw emailError;
  }
};

const sendVerificationEmail = async (email, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
  const htmlContent = `
    <h1>Welcome to Our App!</h1>
    <p>Thank you for registering. Your account has been created successfully.</p>
    <p>To verify your email address, please click on the link below:</p>
    <a href="${verificationUrl}">Verify Your Email</a>
    <p>This link will expire in 24 hours.</p>
    <p>If you didn't create an account, please ignore this email.</p>
  `;
  
  await sendEmail(email, 'Welcome! Please Verify Your Email', htmlContent);
};

const sendLoginNotificationEmail = async (email) => {
  const htmlContent = `
    <h1>New Login to Your Account</h1>
    <p>We detected a new login to your account.</p>
    <p>If this was you, no action is needed.</p>
    <p>If you didn't log in, please secure your account immediately.</p>
  `;
  
  await sendEmail(email, 'New Login Detected', htmlContent);
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
      verificationToken,
      verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      isVerified: false,
    });

    await newUser.save();

    // Create profile for the new user
    const newProfile = new Profile({
      userId: newUser._id,
      firstName,
      lastName,
      phone,
      email,
      address: typeof address === 'object' ? JSON.stringify(address) : address
    });

    await newProfile.save();

    const token = createToken(newUser._id);

    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    res.status(201).json({
      success: true,
      message: "User registered successfully. Please check your email for verification.",
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        isVerified: newUser.isVerified
      },
      profile: newProfile
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

    try {
      await sendLoginNotificationEmail(email);
    } catch (emailError) {
      console.error('Failed to send login notification email:', emailError);
    }

    const profile = await Profile.findOne({ userId: user._id });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        isVerified: user.isVerified
      },
      profile
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

const verifyEmail = async (req, res) => {
  const { token } = req.params;
  try {
    const user = await User.findOne({ 
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired verification token" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
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
    // Implement your refresh token logic here
    const newAccessToken = ""; // Generate new access token
    res.json({ success: true, token: newAccessToken });
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid refresh token" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyEmail,
  refreshToken
};