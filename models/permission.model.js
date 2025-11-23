import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        
    },

    permissionId: {
        type: String,
        required: true,
        
    },
   
    userEmail: {
        type: String,
        required: true,
        
    },
    
    projectId: {
        type: String
    },
    
    permissionStatus: {
        type: String,
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
        default: 24 * 60 * 60 * 1000,
    },


        
},{
    timestamps: true,
});

export const Permission = mongoose.model('Permission_Data',permissionSchema);
