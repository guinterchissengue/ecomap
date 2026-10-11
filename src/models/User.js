import mongoose from 'mongoose';

// define the user schema for community members reporting environmental issues
const userschema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'please provide a valid email address']
    },
    neighborhood: {
        type: String,
        required: [true, 'neighborhood is required'],
        trim: true
    },
    // github account id, set when the user signs in through oauth
    githubId: {
        type: String,
        unique: true,
        sparse: true,
        select: false
    },
    role: {
        type: String,
        enum: ['citizen', 'administrator'],
        default: 'citizen'
    }
}, {
    timestamps: true // automatically adds createdAt and updatedAt
});

const User = mongoose.model('User', userschema);
export default User;