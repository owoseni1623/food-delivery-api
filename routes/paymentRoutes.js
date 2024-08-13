// const express = require("express")
// const paymentController = require("../controllers/paymentController");
// const paymentAuthMiddleware = require('../middleware/paymentAuthMiddleware')

// const router = express.Router();


// router.post('/api/create-payment-link', (req, res, next) => {
//   console.log('Request body:', req.body);
//   console.log('Authenticated user:', req.user);
//   paymentController.initializePayment(req, res, next);
// });
// router.get('/verify',paymentAuthMiddleware, paymentController.verifyPayment);


// module.exports = router;



const express = require("express");
const paymentController = require("../controllers/paymentController");
const paymentAuthMiddleware = require('../middleware/paymentAuthMiddleware');

const router = express.Router();

router.post('/create-payment-link', paymentAuthMiddleware, paymentController.initializePayment);
router.get('/verify', paymentAuthMiddleware, paymentController.verifyPayment);

module.exports = router;