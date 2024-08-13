const User = require('./models/User');
const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

async function updateCartItems() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({});
    for (let user of users) {
      if (user.cartData && user.cartData.length > 0) {
        const updatedCartData = user.cartData.map(item => ({
          ...item,
          image: item.image || '/uploads/default-image.jpg'
        }));
        await User.updateOne({ _id: user._id }, { $set: { cartData: updatedCartData } });
      }
    }
    console.log('Cart items updated successfully');
  } catch (error) {
    console.error('Error updating cart items:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function
updateCartItems().then(() => {
  console.log('Script completed');
}).catch((error) => {
  console.error('Script failed:', error);
});

updateCartItems();