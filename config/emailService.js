const transporter = require('../config/emailConfig');

const emailService = {
    sendVerificationEmail: async (userEmail, username, verificationUrl) => {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: 'Verify Your Email for Our Food Ordering App',
            text: `Hello ${username},\n\nPlease verify your email by clicking on the following link: ${verificationUrl}\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nThe Food Ordering Team`
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`Verification email sent to ${userEmail}`);
        } catch (error) {
            console.error('Error sending verification email:', error);
            throw error;
        }
    },

    sendRegistrationEmail: async (userEmail, username) => {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: 'Welcome to Our Food Ordering App',
            text: `Hello ${username},\n\nWelcome to our food ordering app! We're excited to have you on board.\n\nBest regards,\nThe Food Ordering Team`
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`Registration email sent to ${userEmail}`);
        } catch (error) {
            console.error('Error sending registration email:', error);
            throw error;
        }
    },

    sendLoginNotification: async (userEmail, username) => {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: 'New Login to Your Food Ordering Account',
            text: `Hello ${username},\n\nWe detected a new login to your account. If this was you, no action is needed. If you didn't log in, please contact our support team immediately.\n\nBest regards,\nThe Food Ordering Team`
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`Login notification email sent to ${userEmail}`);
        } catch (error) {
            console.error('Error sending login notification email:', error);
            throw error;
        }
    }
};

module.exports = emailService;