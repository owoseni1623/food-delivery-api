// // const jwt = require("jsonwebtoken");

// // module.exports = function(req, res, next) {
// //   const token = req.header('x-auth-token');
// //   if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

// //   try {
// //     const decoded = jwt.verify(token, process.env.JWT_SECRET);
// //     req.user = decoded;
// //     next();
// //   } catch (error) {
// //     res.status(400).json({ message: 'Token is not valid' });
// //   }
// // };

// // const jwt = require('jsonwebtoken');

// // const auth = (req, res, next) => {
// //   // Check for token in various places
// //   const token = req.header('Authorization') || req.header('token') || req.query.token;

// //   if (!token) {
// //     return res.status(401).json({ success: false, message: 'No token provided, authorization denied' });
// //   }

// //   try {
// //     // Verify token
// //     const decoded = jwt.verify(token, process.env.JWT_SECRET || JWT_SECRET);
    
// //     // Add user from payload
// //     req.user = decoded;
// //     next();
// //   } catch (e) {
// //     res.status(400).json({ success: false, message: 'Token is not valid' });
// //   }
// // };

// // module.exports = auth;

// const jwt = require("jsonwebtoken");
// // const User = require("../models/User");

// const auth = async (req, res, next) =>{
//     const token = req.header("auth-token");
//     console.log("Received token:", token);
//     if (!token) {
//         res.json("Unauthorized Access - No token provided");
//     }else {
//         try {
//             const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

//             console.log("Decoded token:", decoded);
//         console.log("Current time:", Math.floor(Date.now() / 1000));
//         console.log("Token expiration time:", decoded.exp);

//         if (decoded.exp <= Math.floor(Date.now() / 1000)) {
//             return res.status(401).json({ message: "Unauthorized Access - Token has expired" });
//         }
//             const user = await User.findById(decoded.id).select("-password");
//             console.log("User found:", user ? "Yes" : "No");
//             if (!user) {
//                 return res.status(401).json({ message: "Unauthorized Access - User not found" });
//             }
//             next();
//             req.user = user;
//         } catch (error) {
//             res.json({ message: "Invalid Token"})
//         }
//     }
// }
// const admin = async (req, res, next) => {
//     if (req.user.role !== "admin") {
//         res.json("Access Denied");
//     }

//     next();
// };
// const optional = async( req, res, next) => {
//     const token = req.header("auth-token");
//     if (!token) {
//         return next();
//     }

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        
//             const user = await User.findById(decoded.id).select("-password");
//             req.user = user
//             console.log(user);
//             next();
//     } catch (error) {
//         console.log(error);
//     }
// };

// module.exports = {auth, admin, optional}



// const jwt = require("jsonwebtoken");
// const User = require("../models/User");

// const generateToken = (user) => {
//     return jwt.sign(
//         { id: user._id, role: user.role },
//         process.env.JWT_SECRET_KEY
        
//     );
// };

// const auth = async (req, res, next) => {
//     const token = req.header("auth-token");
//     console.log("Received token:", token);
//     if (!token) {
//         return res.status(401).json({ message: "Unauthorized Access - No token provided" });
//     }
//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
//         console.log("Decoded token:", decoded);
//         console.log("Current time:", Math.floor(Date.now() / 1000));
//         console.log("Token expiration time:", decoded.exp);

//         if (decoded.exp <= Math.floor(Date.now() / 1000)) {
//             return res.status(401).json({ message: "Unauthorized Access - Token has expired" });
//         }

//         const user = await User.findById(decoded.id).select("-password");
//         console.log("User found:", user ? "Yes" : "No");
//         if (!user) {
//             return res.status(401).json({ message: "Unauthorized Access - User not found" });
//         }
//         req.user = user;
//         next();
//     } catch (error) {
//         console.error("Token verification error:", error);
//         if (error instanceof jwt.JsonWebTokenError) {
//             return res.status(401).json({ message: "Unauthorized Access - Invalid token structure" });
//         } else if (error instanceof jwt.TokenExpiredError) {
//             return res.status(401).json({ message: "Unauthorized Access - Token has expired" });
//         } else {
//             return res.status(401).json({ message: "Unauthorized Access - Token verification failed", error: error.message });
//         }
//     }
// };

// const admin = async (req, res, next) => {
//     if (req.user.role !== "admin") {
//         return res.status(403).json({ message: "Access Denied - Admin privileges required" });
//     }
//     next();
// };

// const optional = async (req, res, next) => {
//     const token = req.header("auth-token");
//     if (!token) {
//         return next();
//     }

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
//         const user = await User.findById(decoded.id).select("-password");
//         req.user = user;
//         console.log("Optional auth user:", user);
//         next();
//     } catch (error) {
//         console.error("Optional auth error:", error);
//         next();
//     }
// };

// module.exports = { auth, admin, optional, generateToken };


const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (user) => {
    return jwt.sign(
        { _id: user._id, role: user.role },  // Ensure _id is used
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
};

const auth = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Token required' });
    try {
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) return res.status(403).json({ success: false, message: 'Invalid token' });
            console.log("Authenticated user:", user);  // Log for debugging
            req.user = user;  // Ensure user contains _id
            next();
        });
    } catch (error) {
        console.error("Token verification error:", error);
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: "Unauthorized Access - Invalid token structure" });
        } else if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: "Unauthorized Access - Token has expired" });
        } else {
            return res.status(401).json({ message: "Unauthorized Access - Token verification failed", error: error.message });
        }
    }
};

const admin = async (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Access Denied - Admin privileges required" });
    }
    next();
};

const optional = async (req, res, next) => {
    const token = req.header("auth-token");
    if (!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded._id).select("-password");  // Ensure _id is used
        req.user = user;
        console.log("Optional auth user:", user);
        next();
    } catch (error) {
        console.error("Optional auth error:", error);
        next();
    }
};

module.exports = { auth, admin, optional, generateToken };

