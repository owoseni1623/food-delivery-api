const express = require('express');
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/add', authMiddleware, cartController.addToCart);
router.post('/remove', authMiddleware, cartController.removeFromCart);
router.get('/get', authMiddleware, cartController.getCart);
router.post('/update', authMiddleware, cartController.updateQuantity);
router.post('/clear', authMiddleware, cartController.clearCart);
router.post('/merge', authMiddleware, cartController.mergeCart);

module.exports = router;