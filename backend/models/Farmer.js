const mongoose = require('mongoose');

const FarmerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add farmer name']
  },
  fatherName: {
    type: String,
    required: [true, 'Please add father\'s name']
  },
  category: {
    type: String,
    enum: ['General', 'SC', 'ST', 'OBC', 'Others'],
    required: [true, 'Please select a category']
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: [true, 'Please select gender']
  },
  address: {
    type: String,
    required: [true, 'Please add address']
  },
  contactNumber: {
    type: String,
    required: [true, 'Please add contact number']
  },
  aadhaarNumber: {
    type: String,
    required: [true, 'Please add Aadhaar number'],
    unique: true
  },
  bankDetails: {
    accountNumber: {
      type: String,
      required: [true, 'Please add bank account number']
    },
    bankName: {
      type: String,
      required: [true, 'Please add bank name']
    },
    branchLocation: {
      type: String,
      required: [true, 'Please add branch location']
    },
    ifscCode: {
      type: String,
      required: [true, 'Please add IFSC code']
    },
    micrCode: {
      type: String
    },
    accountType: {
      type: String,
      enum: ['Crop Loan', 'Saving Account'],
      required: [true, 'Please select account type']
    }
  },
  hasLoanOrKCC: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Farmer', FarmerSchema); 