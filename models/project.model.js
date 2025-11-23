import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
   
  projectName: {
    type: String,
    required: true
  },

  projectId: {
    type: String,
    required: true
  },

  projectUrl: {
    type: [String],
    default: []
  },
  location: {
    type: String,
    required: true
  },

  date: {
    type: Date,
    default: Date.now,
  },

  longitude: {
    type: String,
    required: true
  },

    latitude: { 
    type: String,
    required: true
  },

 
}, {
  timestamps: true
});

export const Project = mongoose.model('project_data', projectSchema);

 
