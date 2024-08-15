const express = require('express');
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post("/add", authMiddleware, cartController.addToCart);
router.post("/remove", authMiddleware, cartController.removeFromCart);
router.get("/get", authMiddleware, cartController.getCart);
router.post("/clear", authMiddleware, cartController.clearCart);  // New route for clearing the cart

module.exports = router;