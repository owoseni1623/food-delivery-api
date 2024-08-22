const express = require('express');
const orderController = require('../controllers/orderController');
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get('/orderlist', authMiddleware, orderController.getAllOrders);
router.get('/user-orders', authMiddleware, orderController.getUserOrders);
// Change this line
router.post('/create', authMiddleware, orderController.createOrder);  // Changed from '/orderOut' to '/create'
router.get('/get/:id', authMiddleware, orderController.getOrder);
router.put('/edit/:id', authMiddleware, orderController.updateOrderStatus);
router.get('/', authMiddleware, orderController.getOrders);
router.delete('/delete/:id', authMiddleware, orderController.deleteOrder);

module.exports = router;