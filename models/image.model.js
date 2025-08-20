import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  imageKey: {
    type: String,
    required: true,
    unique: true
  }, 

  bucketName: {
    type: String,
    required: true
  }

}, {
  timestamps: true
});

export const Image = mongoose.model('image_data', imageSchema);

 
