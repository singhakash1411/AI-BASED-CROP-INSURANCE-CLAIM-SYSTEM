const mongoose = require('mongoose');

const InsuranceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Personal Information
  farmerName: {
    type: String,
    required: [true, 'Please provide farmer name']
  },
  aadharNumber: {
    type: String,
    required: [true, 'Please provide Aadhar number'],
    minlength: [12, 'Aadhar number must be 12 digits'],
    maxlength: [12, 'Aadhar number must be 12 digits']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Please provide phone number']
  },
  address: {
    type: String,
    required: [true, 'Please provide address']
  },

  // Farm Details
  landArea: {
    type: Number,
    required: [true, 'Please provide land area']
  },
  cropType: {
    type: String,
    required: [true, 'Please provide crop type']
  },
  soilType: {
    type: String,
    required: [true, 'Please provide soil type']
  },
  irrigationSource: {
    type: String,
    required: [true, 'Please provide irrigation source']
  },

  // Documents
  aadharCard: {
    type: String, // URL/path to stored file
    required: [true, 'Please upload Aadhar card']
  },
  landDocument: {
    type: String, // URL/path to stored file
    required: [true, 'Please upload land ownership document']
  },
  bankDocument: {
    type: String, // URL/path to stored file
    required: [true, 'Please upload bank document']
  },

  // Verification Images
  gpsImages: [{
    type: String // Array of URLs/paths to GPS images
  }],
  farmPhotos: [{
    type: String // Array of URLs/paths to farm photos
  }],

  // Application Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Insurance', InsuranceSchema); 