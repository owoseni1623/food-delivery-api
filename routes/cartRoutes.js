const express = require('express');
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post("/add", authMiddleware, cartController.addToCart);
router.post("/remove", authMiddleware, cartController.removeFromCart);
router.get("/get", authMiddleware, cartController.getCart);

module.exports = router;