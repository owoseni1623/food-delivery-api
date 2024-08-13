// const express = require("express");
// const connectDB = require("./config/db");
// const cors = require("cors");
// const menuRoutes = require("./routes/menuRoutes");
// const adminRoutes = require("./routes/adminRoutes");
// const userRoutes = require("./routes/userRoutes");
// const orderRoutes = require("./routes/orderRoutes");
// const cartRoutes = require("./routes/cartRoutes");
// const paymentRoutes = require("./routes/paymentRoutes");
// const restaurantRoutes = require("./routes/restaurantRoutes");
// // const { auth } = require("./middleware/Auth");
// const paymentAuthMiddleware = require("./middleware/paymentAuthMiddleware")
// const path = require("path");
// const { initializePayment } = require("./controllers/paymentController");

// require('dotenv').config();




// const app = express();

// // CORS configuration
// app.use(cors({
//   origin: "http://localhost:5173",
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   credentials: true
  
// }));

// // Specific CORS handling for payment route
// // app.options('/api/payment/initiate', cors());

// // Static folder for uploads
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Middleware
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // Connect to MongoDB
// connectDB()
//   .then(() => {
//     console.log('Connected to MongoDB');
//   })
//   .catch((error) => {
//     console.error('Failed to connect to MongoDB', error);
//     process.exit(1);
//   });

// // Logging middleware
// app.use((req, res, next) => {
//   console.log(`${req.method} ${req.url}`);
//   next();
// });

// // Routes
// app.use("/api/user", userRoutes);
// app.use('/api/menu', menuRoutes);
// app.use('/api/order', orderRoutes);
// app.use("/api/cart", cartRoutes);
// // app.use("/api/admin", adminRoutes);
// app.use('/api/payment',paymentAuthMiddleware, paymentRoutes);
// app.use('/api', restaurantRoutes);


// app.post("/api/create-payment-link", initializePayment)

// // Example route handling
// app.get('/', (req, res) => {
//   res.send('Server is running!');
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error("Detailed error:", err);
//   res.status(500).json({
//     error: 'Something went wrong!',
//     details: err.message,
//     stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
//   });
// });

// // Start the server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));




const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const menuRoutes = require("./routes/menuRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const cartRoutes = require("./routes/cartRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const restaurantRoutes = require("./routes/restaurantRoutes");
// const emailService = require("./utils/emailService");
const emailRoutes = require("./routes/emailRoutes")
const path = require("path");

require('dotenv').config();

const app = express();

// CORS configuration
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to MongoDB
connectDB()
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1);
  });

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/user", userRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use("/api/cart", cartRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api', restaurantRoutes);
app.use('/api/email', emailRoutes);

// New route to handle /api/restaurants
app.get('/api/restaurants', async (req, res) => {
  try {
    const Menu = require('./models/Menu'); // Adjust the path as necessary
    const menuItems = await Menu.find({});
    const restaurants = [{
      id: 'default-restaurant',
      name: 'Default Restaurant',
      menu: menuItems
    }];
    res.json(restaurants);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Example route handling
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Detailed error:", err);
  res.status(500).json({
    error: 'Something went wrong!',
    details: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



// const express = require("express");
// const connectDB = require("./config/db"); // Ensure this correctly connects to MongoDB
// const cors = require("cors");
// const menuRoutes = require("./routes/menuRoutes");
// const userRoutes = require("./routes/userRoutes");
// const orderRoutes = require("./routes/orderRoutes");
// const cartRoutes = require("./routes/cartRoutes");
// const paymentRoutes = require("./routes/paymentRoutes");
// const restaurantRoutes = require("./routes/restaurantRoutes");
// const verifyRoutes = require("./routes/verifyRoutes");
// const path = require("path");
// require('dotenv').config(); // Load environment variables

// const app = express();

// // CORS configuration
// app.use(cors({
//   origin: "http://localhost:5173", // Update this to match your frontend URL
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   credentials: true
// }));

// // Static folder for uploads
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Middleware
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // Connect to MongoDB
// connectDB()
//   .then(() => {
//     console.log('Connected to MongoDB');
//   })
//   .catch((error) => {
//     console.error('Failed to connect to MongoDB', error);
//     process.exit(1);
//   });

// // Logging middleware
// app.use((req, res, next) => {
//   console.log(`${req.method} ${req.url}`);
//   next();
// });

// // Routes
// app.use("/api/user", userRoutes);
// app.use('/api/menu', menuRoutes);
// app.use('/api/orders', orderRoutes);
// app.use("/api/cart", cartRoutes);
// app.use('/api/payment', paymentRoutes);
// app.use('/api', restaurantRoutes);
// app.use('/api/verify', verifyRoutes);

// // Example route handling
// app.get('/', (req, res) => {
//   res.send('Server is running!');
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error("Detailed error:", err);
//   res.status(500).json({
//     error: 'Something went wrong!',
//     details: err.message,
//     stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
//   });
// });

// // Start the server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));