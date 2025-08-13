import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    secondaryEmail: {
        type: String,
        default: null,
    },
    password: {
        type: String,
        unique: true,
    },
    contactNumber: {
        type: String,
        default: null,
    },
    secondaryContactNumber: {
        type: String,
        default: null,
    },
    address: {
        type: String,
        default: null,
    },
    bio: {
        type: String,
        default: null,
    },
    //google sign in
    googleId: {
        type: String,
        unique: true,
        default: null,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
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
    equipment: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'equipment_data',
    }],
    totalEquipment: {
        type: Number,
        default: 0,
    },
    totalAmount: {
        type: Number,
        default: 0,
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
   permission: {
    type: String,
    default: 'null',
    },
   

    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
        
},{
    timestamps: true,
});

export const User = mongoose.model('User_Data',userSchema);
