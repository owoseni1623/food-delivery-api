// const express = require('express');
// const router = express.Router();
// const { addToCart, removeFromCart, getCart} = require("../controllers/cartController");
// const auth = require('../middleware/Auth'); // Assuming you have an auth middleware

// // // All routes are protected with auth middleware
// // router.use(auth);

// // Get user's cart
// router.get('/', cartController.getCart);

// // Add item to cart
// router.post('/add',auth, cartController.addToCart);

// // Remove item from cart
// router.delete('/remove/:menuItemId', cartController.removeFromCart);

// // Update item quantity in cart
// router.put('/update/:menuItemId', cartController.updateCartItemQuantity);

// // Clear entire cart
// router.delete('/clear', cartController.clearCart);

// module.exports = router;



// const express = require("express");
// const { auth } = require("../middleware/Auth");
// const { getCart, updateCart } = require("../controllers/cartController");

// const router = express.Router();

// router.get('/api/cart', auth, getCart);
// router.put('/api/cart', auth, updateCart);

// module.exports = router;


// const express = require("express");
// const { auth } = require("../middleware/Auth");
// const { getCart, updateCart, addToCart } = require("../controllers/cartController");

// const router = express.Router();


// router.post('/add',auth, addToCart);
// router.get('/get', auth, getCart);
// router.post('/update', auth, updateCart);

// module.exports = router;



// routes/cartRoutes.js
const express = require('express');
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post("/add", authMiddleware, cartController.addToCart);
router.post("/remove", authMiddleware, cartController.removeFromCart);
router.get("/get", authMiddleware, cartController.getCart);

module.exports = router;