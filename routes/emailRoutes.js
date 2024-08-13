const express = require('express');
const { verifyEmail } = require('../controllers/emailController');

const emailRouter = express.Router();

emailRouter.get('/verify/:token', verifyEmail);

module.exports = emailRouter;