import mongoose from "mongoose";

const lmsUserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
    },
    contactNumber: {
        type: String,
        default: null,
    },
    //google sign in
    googleId: {
        type: String,
        unique: true,
        default: null,
    },
    role: {
        type: String,
        enum: ['student', 'lecture'],
        default: 'student',
    },
    lastLogin: {
        type: Date,
        default: Date.now,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    status:{
        type: String,
        default: "active"
    },
    hasEquipmentBooked: {
        type: Boolean,
        default: false,
    },
    imageKey:{
    type: String,
    default: null,
   },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
        
},{
    timestamps: true,
});

export const LmsUser = mongoose.model('lms_user_Data',lmsUserSchema);
