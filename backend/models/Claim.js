const mongoose = require('mongoose');

const ClaimSchema = new mongoose.Schema({
  policy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InsurancePolicy',
    required: true
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  claimNumber: {
    type: String,
    unique: true,
    required: true
  },
  cropUnderLoss: {
    type: String,
    required: [true, 'Please add crop under loss']
  },
  dateOfLoss: {
    type: Date,
    required: [true, 'Please add date of loss']
  },
  causeOfLoss: {
    type: String,
    required: [true, 'Please add cause of loss']
  },
  localizedRisk: {
    type: String
  },
  declaration: {
    type: String,
    required: [true, 'Please add declaration']
  },
  place: {
    type: String,
    required: [true, 'Please add place']
  },
  claimDate: {
    type: Date,
    default: Date.now
  },
  claimAmount: {
    type: Number
  },
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  documents: {
    landRegistration: {
      type: String
    },
    landOwnership: {
      type: String
    },
    aadhaarCard: {
      type: String
    },
    identificationProof: {
      type: String
    },
    bankDetails: {
      type: String
    },
    sowingDeclaration: {
      type: String
    },
    gpsImage: {
      type: String
    }
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewDate: {
    type: Date
  },
  remarks: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate claim number before saving
ClaimSchema.pre('save', async function(next) {
  if (!this.isNew) {
    next();
    return;
  }
  
  // Generate a unique claim number (CLAIM-YYYY-RANDOM)
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
  this.claimNumber = `CLAIM-${year}-${random}`;
  next();
});

module.exports = mongoose.model('Claim', ClaimSchema); 