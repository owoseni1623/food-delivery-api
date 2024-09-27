const transporter = require('./emailConfig');

const emailService = {
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
        }
    }
};

module.exports = emailService;