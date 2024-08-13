// const jwt = require('jsonwebtoken')

// const authMiddleware = async (req, res, next) =>{
//     const {token} = req.headers;
//     if (!token) {
//         return res.json({success: false, message: "Not Authorized Login Again"})
//     }
//     try {
//         const token_decode = jwt.verify(token, process.env.JWT_SECRET);
//         req.body.userId = token_decode.id;
//         next();
//     } catch (error) {
//         console.log(error);
//         res.json({success: false, message: "Error"})
        
//     }
// }

// module.exports = authMiddleware;

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found, authorization denied' });
    }

    req.token = token;
    req.user = user;
    console.log('Auth middleware: User authenticated', user._id);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token, authorization denied' });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired, authorization denied' });
    }

    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = authMiddleware;

