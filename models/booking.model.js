import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
   
  equipmentname: {
    type: String,
    required: true
  },

  equipmentId: {
    type: String,
    required: true
  },

  status: { 
    type: String, 
    enum: ['pending', 'confirmed',"cancelled","completed"], 
    default: 'pending' ,
    
  },

  userId: {
    type: String,
    
  },

  userName: {
    type: String
  },

  userEmail: { 
    type: String
  },
  phone:{
    type: String
  },

  startDate: {
    type: Date,
    default: null
  },

  endDate: {
    type: Date,
    default: null
  },
  date: {
    type: Date,
    default: Date.now,
  },

  amount:{
    rype: String
  },
  
  totalAmount: {
    type: String
  },
 
}, {
  timestamps: true
});

export const Booking = mongoose.model('booking_data', bookingSchema);

 
