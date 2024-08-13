const express = require("express");
const router = express.Router();
const restaurantController = require("../controllers/restaurantController");
const menuController = require("../controllers/menuController");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|avif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Images only!"));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
}).single("image");

router.post("/restaurants", upload, restaurantController.createRestaurant);
router.get("/restaurants", restaurantController.getAllRestaurants);
router.get("/restaurants/:id", restaurantController.getRestaurant);
router.put("/restaurants/:id", upload, restaurantController.updateRestaurant);
router.delete("/restaurants/:id", restaurantController.deleteRestaurant);

router.post("/restaurants/:restaurantId/menu", upload, restaurantController.createMenuItem);
// router.get("/restaurants", restaurantController.getAllRestaurants);
// router.get("/restaurants/:id", restaurantController.getRestaurant);
// router.put("/restaurants/:id", upload, restaurantController.updateRestaurant);
// router.delete("/restaurants/:id", restaurantController.deleteRestaurant);

router.delete("/restaurants/:restaurantId/menu/:menuId", menuController.deleteMenuItem);



module.exports = router;
