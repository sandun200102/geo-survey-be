import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    courseName: {
        type: String,
        required: true,
    },
    CourseCode: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
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

export const Course = mongoose.model('course_data',courseSchema);
