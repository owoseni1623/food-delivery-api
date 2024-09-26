const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
        default: null
    }
}, { 
    minimize: false,
    timestamps: true 
});

// Virtual for full name
profileSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Method to get public profile
profileSchema.methods.getPublicProfile = function() {
    const publicProfile = this.toObject();
    delete publicProfile.userId;
    return publicProfile;
};

const Profile = mongoose.model("Profile", profileSchema);

module.exports = Profile;