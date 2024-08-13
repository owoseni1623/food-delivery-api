// const express = require('express');
// const menuController = require("../controllers/menuController");

// const router = express.Router();

// router.post('/add', menuController.createMenuItem);
// router.get('/', menuController.getAllMenuItems);
// router.get('/getAll', menuController.getAllMenuItems);
// router.get('/getOne/:id', menuController.getMenuItem);
// router.put('/update/:id', menuController.updateMenuItem);
// router.delete('/delete/:id', menuController.deleteMenuItem);

// module.exports = router;



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





// const express = require('express');
// const menuController = require("../controllers/menuController");
// const multer = require('multer');
// const path = require('path');

// const router = express.Router();

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(__dirname, '../uploads'));
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
//     cb(null, uniqueSuffix);
//   }
// });

// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype.startsWith('image/')) {
//       cb(null, true);
//     } else {
//       cb(new Error('Not an image! Please upload an image.'), false);
//     }
//   },
// });

// router.post('/add', upload.single('image'), menuController.createMenuItem);
// router.get('/', menuController.getAllMenuItems);
// router.get('/getAll', menuController.getAllMenuItems);
// router.get('/getOne/:id', menuController.getMenuItem);
// router.put('/update/:id', upload.single('image'), menuController.updateMenuItem);
// router.delete('/delete/:id', menuController.deleteMenuItem);

// module.exports = router;
