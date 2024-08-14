const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (user) => {
    return jwt.sign(
        { _id: user._id, role: user.role },
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
            console.log("Authenticated user:", user); 
            req.user = user;
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

