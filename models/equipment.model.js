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
    enum: ['available', 'booked', 'maintenance'], 
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
  } 

}, {
  timestamps: true
});

export const Equipment = mongoose.model('equipment_data', equipmentSchema);

 
