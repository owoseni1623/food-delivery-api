const express = require('express');
const router = express.Router();
const { updateProfile, getProfile, getOrderHistory } = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/get', authMiddleware, getProfile);
router.post('/update', authMiddleware, updateProfile);
router.get('/order-history', authMiddleware, getOrderHistory);

module.exports = router;