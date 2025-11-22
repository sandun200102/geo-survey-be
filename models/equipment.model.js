import mongoose from 'mongoose';

const equipmentSchema = new mongoose.Schema({
   equipmentId: {
    type: String,
    required: true,
    unique: true
  }, 
  name: {
    type: String,
    required: true
  },

  category: {
    type: String,
    required: true
  },

  status: { 
    type: String, 
    enum: ['available', 'booked', 'maintenance' ,"pending"], 
    default: 'available' ,
    required: true
  },

  location: {
    type: String,
    required: true,
    default:'store'
  },

  description: {
    type: String
  },

  bookedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User_data',
  },

  hiredAt: {
    type: Date,
    default: Date.now
  },

  value: {
    type: Number
  },
  //images array
   imageKey:{
    type: String,
    default: null,
   },
   bucketName:{
    type: String,
    default: null
   },

}, {
  timestamps: true
});

export const Equipment = mongoose.model('equipment_data', equipmentSchema);

 
