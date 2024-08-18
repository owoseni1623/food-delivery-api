// const express = require('express');
// const router = express.Router();
// const { registerUser, loginUser, getUserProfile, updateUserProfile } = require('../controllers/userController');
// const authMiddleware = require('../middleware/authMiddleware');
// const multer = require('multer');
// const path = require('path');

// // Configure multer for file uploads
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/')
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname))
//   }
// });

// const upload = multer({ storage: storage });

// // User routes
// router.post('/register', registerUser);
// router.post('/login', loginUser);
// router.get('/profile', authMiddleware, getUserProfile);
// router.put('/profile', authMiddleware, upload.single('avatar'), updateUserProfile);

// module.exports = router;



const express = require('express');
const { registerUser, loginUser, getUserProfile, updateUserProfile } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');



const router = express.Router();



// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});
const upload = multer({ storage: storage });

// User routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, upload.single('avatar'), updateUserProfile);



module.exports = router;