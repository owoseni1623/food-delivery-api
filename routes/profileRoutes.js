const express = require('express');
const { getProfile, updateProfile, getOrderHistory } = require("../controllers/profileController");
const { auth } = require("../middleware/Auth");

const router = express.Router();

router.get('/', auth, getProfile);
router.put('/', auth, updateProfile);
router.get('/orders', auth, getOrderHistory);

module.exports = router;