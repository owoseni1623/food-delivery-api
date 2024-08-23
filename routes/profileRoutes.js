// const express = require('express');
// const { getProfile, updateProfile, getOrderHistory } = require("../controllers/profileController");
// const authMiddleware = require('../middleware/authMiddleware');

// const router = express.Router();

// router.get('/get', authMiddleware, getProfile);
// router.post('/update', authMiddleware, updateProfile);
// router.get('/orders', authMiddleware, getOrderHistory);

// module.exports = router;



const express = require('express');
const { getProfile, updateProfile, getOrderHistory } = require("../controllers/profileController");
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/get', authMiddleware, getProfile);
router.post('/update', authMiddleware, updateProfile);
router.get('/orders', authMiddleware, getOrderHistory);

module.exports = router;