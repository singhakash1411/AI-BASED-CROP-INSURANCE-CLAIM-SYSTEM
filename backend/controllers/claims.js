const Claim = require('../models/Claim');
const InsurancePolicy = require('../models/InsurancePolicy');
const Farmer = require('../models/Farmer');

// @desc    Create new claim
// @route   POST /api/v1/claims
// @access  Private
exports.createClaim = async (req, res, next) => {
  try {
    // Check if policy exists
    const policy = await InsurancePolicy.findById(req.body.policy);
    
    if (!policy) {
      return res.status(404).json({
        success: false,
        error: 'Policy not found'
      });
    }
    
    // Check if farmer exists
    const farmer = await Farmer.findById(req.body.farmer);
    
    if (!farmer) {
      return res.status(404).json({
        success: false,
        error: 'Farmer not found'
      });
    }
    
    // Make sure user is farmer owner or admin
    if (farmer.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to create claim for this farmer'
      });
    }
    
    // Make sure policy belongs to farmer
    if (policy.farmer.toString() !== farmer._id.toString()) {
      return res.status(400).json({
        success: false,
        error: 'Policy does not belong to this farmer'
      });
    }
    
    const claim = await Claim.create(req.body);
    
    res.status(201).json({
      success: true,
      data: claim
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get all claims
// @route   GET /api/v1/claims
// @access  Private/Admin
exports.getClaims = async (req, res, next) => {
  try {
    let query;
    
    // If user is not admin, show only claims for their farmers
    if (req.user.role !== 'admin') {
      // Find farmers that belong to logged in user
      const farmers = await Farmer.find({ user: req.user.id });
      
      // Get farmer IDs
      const farmerIds = farmers.map(farmer => farmer._id);
      
      // Find claims for these farmers
      query = Claim.find({ farmer: { $in: farmerIds } });
    } else {
      query = Claim.find();
    }
    
    // Execute query
    const claims = await query.populate([
      {
        path: 'farmer',
        select: 'name aadhaarNumber contactNumber'
      },
      {
        path: 'policy',
        select: 'policyNumber cropType areaInsured sumInsured'
      }
    ]);
    
    res.status(200).json({
      success: true,
      count: claims.length,
      data: claims
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get single claim
// @route   GET /api/v1/claims/:id
// @access  Private
exports.getClaim = async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id).populate([
      {
        path: 'farmer',
        select: 'name aadhaarNumber contactNumber address bankDetails'
      },
      {
        path: 'policy',
        select: 'policyNumber cropType areaInsured sumInsured premium startDate endDate'
      }
    ]);
    
    if (!claim) {
      return res.status(404).json({
        success: false,
        error: 'Claim not found'
      });
    }
    
    // If user is not admin, make sure they own the farmer
    if (req.user.role !== 'admin') {
      const farmer = await Farmer.findById(claim.farmer);
      
      if (!farmer || farmer.user.toString() !== req.user.id) {
        return res.status(401).json({
          success: false,
          error: 'Not authorized to access this claim'
        });
      }
    }
    
    res.status(200).json({
      success: true,
      data: claim
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Update claim
// @route   PUT /api/v1/claims/:id
// @access  Private
exports.updateClaim = async (req, res, next) => {
  try {
    let claim = await Claim.findById(req.params.id);
    
    if (!claim) {
      return res.status(404).json({
        success: false,
        error: 'Claim not found'
      });
    }
    
    // If user is not admin, make sure they own the farmer
    if (req.user.role !== 'admin') {
      const farmer = await Farmer.findById(claim.farmer);
      
      if (!farmer || farmer.user.toString() !== req.user.id) {
        return res.status(401).json({
          success: false,
          error: 'Not authorized to update this claim'
        });
      }
      
      // Regular users can only update documents
      const allowedFields = ['documents'];
      
      // Filter out fields that are not allowed
      Object.keys(req.body).forEach(key => {
        if (!allowedFields.includes(key)) {
          delete req.body[key];
        }
      });
    }
    
    claim = await Claim.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: claim
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Delete claim
// @route   DELETE /api/v1/claims/:id
// @access  Private
exports.deleteClaim = async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id);
    
    if (!claim) {
      return res.status(404).json({
        success: false,
        error: 'Claim not found'
      });
    }
    
    // If user is not admin, make sure they own the farmer
    if (req.user.role !== 'admin') {
      const farmer = await Farmer.findById(claim.farmer);
      
      if (!farmer || farmer.user.toString() !== req.user.id) {
        return res.status(401).json({
          success: false,
          error: 'Not authorized to delete this claim'
        });
      }
      
      // Regular users can only delete claims with 'Pending' status
      if (claim.status !== 'Pending') {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete claim that is already under review or processed'
        });
      }
    }
    
    await claim.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Update claim status (admin only)
// @route   PUT /api/v1/claims/:id/status
// @access  Private/Admin
exports.updateClaimStatus = async (req, res, next) => {
  try {
    const { status, remarks, claimAmount } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Please provide status'
      });
    }
    
    let claim = await Claim.findById(req.params.id);
    
    if (!claim) {
      return res.status(404).json({
        success: false,
        error: 'Claim not found'
      });
    }
    
    // Only admin can update claim status
    if (req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update claim status'
      });
    }
    
    const updateData = {
      status,
      reviewedBy: req.user.id,
      reviewDate: Date.now()
    };
    
    if (remarks) {
      updateData.remarks = remarks;
    }
    
    if (claimAmount) {
      updateData.claimAmount = claimAmount;
    }
    
    claim = await Claim.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: claim
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
}; 