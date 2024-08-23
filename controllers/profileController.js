// const User = require("../models/User");
// const Profile = require("../models/Profile")
// const Order = require("../models/Order");

// const getProfile = async (req, res) => {
//   try {
//       const user = req.user;                                        // to get the user from the request
//       const userDetails = await User.findById(user._id);
//       let profile = await Profile.findOne({ userId: user._id });
      
//       if (!profile) {
          
//           profile = new Profile({                   //this logic is for If no profile exists,then it should create one idea from  gbemi
//               userId: user._id,
//               firstName: userDetails.name,
//               email: userDetails.email,
//               address: userDetails.address
//           });
//           await profile.save();
//       }
//       console.log("Sending profile:", profile); 
//       res.json({ 
//           success: true, 
//           profile: {
//               ...profile.toObject(),
//               image: profile.image // to ensure image is included
//           }, 
//           userDetails 
//       });
//   } catch (error) {
//       console.error(error);
//       res.status(500).json({ success: false, message: 'Server error' });
//   }
// };


// const updateProfile = async (req, res) => {
//   console.log('Request body:', req.body);
//   console.log('Request file:', req.file);
//   try {
//     const user = req.user;
//     const { firstName, lastName, phone, address } = req.body;
//     let image = req.file ? req.file.filename : undefined; // Use undefined instead of null

//     let profile = await Profile.findOne({ userId: user._id });
//     if (profile) {
//       // Update only if the field is provided in the request
//       if (firstName) profile.firstName = firstName;
//       if (lastName) profile.lastName = lastName;
//       if (phone) profile.phone = phone;
//       if (address) profile.address = address;
//       if (image) profile.image = image;
//     } else {
//       profile = new Profile({
//         userId: user._id,
//         firstName,
//         lastName,
//         phone,
//         image,
//         address
//       });
//     }

//     await profile.save();

//     // Fetch the updated profile to ensure we have all fields
//     const updatedProfile = await Profile.findOne({ userId: user._id });

//     console.log("Updated profile:", updatedProfile);

//     res.json({ 
//       success: true, 
//       profile: updatedProfile.toObject() // Convert to plain object to include all fields
//     });
//   } catch (error) {
//     console.error('Profile update error:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// const getOrderHistory = async (req, res) => {
//   try {
//     const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
//     res.json({ success: true, orders });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };

// module.exports = { getProfile, updateProfile, getOrderHistory };





const User = require("../models/User");
const Profile = require("../models/Profile");
const Order = require("../models/Order");
const multer = require('multer');
const path = require('path');

// Set up multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage }).single('image');

const getProfile = async (req, res) => {
  try {
    const user = req.user;
    const userDetails = await User.findById(user._id);
    let profile = await Profile.findOne({ userId: user._id });
   
    if (!profile) {
      profile = new Profile({
        userId: user._id,
        firstName: userDetails.name,
        email: userDetails.email,
        address: userDetails.address
      });
      await profile.save();
    }
    console.log("Sending profile:", profile);
    res.json({
      success: true,
      profile: {
        ...profile.toObject(),
        image: profile.image
      },
      userDetails
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json({ success: false, message: 'File upload error' });
    } else if (err) {
      return res.status(500).json({ success: false, message: 'Unknown error during file upload' });
    }

    try {
      const user = req.user;
      const { firstName, lastName, phone, address, email } = req.body;
      let image = req.file ? req.file.filename : undefined;

      let profile = await Profile.findOne({ userId: user._id });
      if (profile) {
        if (firstName) profile.firstName = firstName;
        if (lastName) profile.lastName = lastName;
        if (phone) profile.phone = phone;
        if (address) profile.address = address;
        if (email) profile.email = email;
        if (image) profile.image = image;
      } else {
        profile = new Profile({
          userId: user._id,
          firstName,
          lastName,
          phone,
          email,
          image,
          address
        });
      }
      await profile.save();

      const updatedProfile = await Profile.findOne({ userId: user._id });
      console.log("Updated profile:", updatedProfile);
      res.json({
        success: true,
        profile: updatedProfile.toObject()
      });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
};

const getOrderHistory = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = { getProfile, updateProfile, getOrderHistory };