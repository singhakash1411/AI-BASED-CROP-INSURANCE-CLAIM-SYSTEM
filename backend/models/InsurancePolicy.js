const mongoose = require('mongoose');

const InsurancePolicySchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  policyNumber: {
    type: String,
    unique: true,
    required: true
  },
  cropType: {
    type: String,
    required: [true, 'Please add crop type']
  },
  areaInsured: {
    type: Number,
    required: [true, 'Please add insured area in hectares']
  },
  sumInsured: {
    type: Number,
    required: [true, 'Please add sum insured amount']
  },
  premium: {
    type: Number,
    required: [true, 'Please add premium amount']
  },
  startDate: {
    type: Date,
    required: [true, 'Please add policy start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please add policy end date']
  },
  status: {
    type: String,
    enum: ['Active', 'Expired', 'Cancelled'],
    default: 'Active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate policy number before saving
InsurancePolicySchema.pre('save', async function(next) {
  if (!this.isNew) {
    next();
    return;
  }
  
  // Generate a unique policy number (CIS-YYYY-RANDOM)
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
  this.policyNumber = `CIS-${year}-${random}`;
  next();
});

module.exports = mongoose.model('InsurancePolicy', InsurancePolicySchema); 