const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    address: {
        type: String,
        trim: true
    },
    image: {
        type: String,
        default: null
    }
}, { 
    timestamps: true 
});

profileSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`.trim();
});

profileSchema.methods.getPublicProfile = function() {
    const publicProfile = this.toObject();
    delete publicProfile.userId;
    return publicProfile;
};

const Profile = mongoose.model("Profile", profileSchema);

module.exports = Profile;