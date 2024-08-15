const express = require("express");
const paymentController = require("../controllers/paymentController");
const paymentAuthMiddleware = require('../middleware/paymentAuthMiddleware');

const router = express.Router();

// Payment routes
router.post('/create-payment-link', paymentAuthMiddleware, paymentController.initializePayment);
router.get('/verify', paymentAuthMiddleware, paymentController.verifyPayment);

module.exports = router;