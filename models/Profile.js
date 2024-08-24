const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        unique: true
    },
    firstName: String,
    lastName: String,
    phone: String,
    email: String,
    address: String,
    image: {
        type: String,
    },
}, { minimize: false });

const Profile = mongoose.model("Profile", profileSchema);

module.exports = Profile;