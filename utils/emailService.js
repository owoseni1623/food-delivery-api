// const nodemailer = require('nodemailer');
// const crypto = require('crypto');

// // Create a map to store verification codes
// const verificationCodes = new Map();

// // Create the transporter
// console.log('Email User:', process.env.EMAIL_USER);
// console.log('Email App Password:', process.env.EMAIL_APP_PASSWORD ? '[REDACTED]' : 'Not set');
// const transporter = nodemailer.createTransport({
//   host: 'smtp.gmail.com',
//   port: 587,
//   secure: false,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_APP_PASSWORD
//   },
//   tls: {
//     rejectUnauthorized: false,
//     minVersion: 'TLSv1.2'
//   }
// });

// // Verify the transporter configuration
// transporter.verify(function(error, success) {
//   if (error) {
//     console.log('Transporter verification error:', error);
//     console.log('Error code:', error.code);
//     console.log('Error message:', error.message);
//     console.log('Error stack:', error.stack);
//     console.log('Transporter verification error:', error);
//   } else {
//     console.log("Server is ready to take our messages");
//   }
// });

// // Generate a verification code
// const generateVerificationCode = () => {
//   return crypto.randomBytes(3).toString('hex').toUpperCase();
// };

// // Send verification email
// const sendVerificationEmail = async (email) => {
//   const verificationCode = generateVerificationCode();

//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: email,
//     subject: 'Email Verification',
//     text: `Your verification code is: ${verificationCode}`
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log('Verification email sent successfully');

//     // Store the verification code with an expiration time (10 minutes)
//     verificationCodes.set(email, {
//       code: verificationCode,
//       expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
//     });

//     return verificationCode;
//   } catch (error) {
//     console.error('Error sending verification email:', error);
//     throw error; // Propagate the error
//   }
// };

// // Verify the email code
// const verifyEmailCode = async (email, code) => {
//   const storedCode = verificationCodes.get(email);

//   if (!storedCode) {
//     return false;
//   }

//   if (Date.now() > storedCode.expiresAt) {
//     verificationCodes.delete(email);
//     return false;
//   }

//   if (storedCode.code === code) {
//     verificationCodes.delete(email);
//     return true;
//   }

//   return false;
// };

// module.exports = {
//   sendVerificationEmail,
//   verifyEmailCode
// };