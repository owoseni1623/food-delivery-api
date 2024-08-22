const express = require('express');
const menuController = require("../controllers/menuController");

const router = express.Router();

router.post('/add', menuController.createMenuItem);
router.get('/', menuController.getAllMenuItems);
router.get('/getAll', menuController.getAllMenuItems);
router.get('/getOne/:id', menuController.getMenuItem);
router.put('/update/:id', menuController.updateMenuItem);
router.delete('/delete/:id', menuController.deleteMenuItem);

// New route for /api/restaurants
router.get('/restaurants', menuController.getRestaurants);

module.exports = router;




