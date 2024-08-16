// const User = require("../models/User");

// const verifyEmail = async (req, res) => {
//     const { token } = req.params;

//     try {
//         const user = await User.findOne({ verificationToken: token });

//         if (!user) {
//             return res.status(400).json({ success: false, message: 'Invalid verification token.' });
//         }

//         user.isVerified = true;
//         user.verificationToken = undefined;
//         user.verificationTokenExpires = undefined;

//         await user.save();

//         res.redirect(`${process.env.FRONTEND_URL}/login`);
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

// module.exports = { verifyEmail };



const User = require("../models/User");

const verifyEmail = async (req, res) => {
  const { token } = req.params;
  try {
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid verification token.' });
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    res.redirect(`${process.env.FRONTEND_URL}/login?verified=true`);
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { verifyEmail };