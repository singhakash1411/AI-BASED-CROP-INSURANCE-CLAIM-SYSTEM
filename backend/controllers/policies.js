const InsurancePolicy = require('../models/InsurancePolicy');
const Farmer = require('../models/Farmer');

// @desc    Create new insurance policy
// @route   POST /api/v1/policies
// @access  Private
exports.createPolicy = async (req, res, next) => {
  try {
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
        error: 'Not authorized to create policy for this farmer'
      });
    }
    
    const policy = await InsurancePolicy.create(req.body);
    
    res.status(201).json({
      success: true,
      data: policy
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get all policies
// @route   GET /api/v1/policies
// @access  Private/Admin
exports.getPolicies = async (req, res, next) => {
  try {
    let query;
    
    // If user is not admin, show only policies for their farmers
    if (req.user.role !== 'admin') {
      // Find farmers that belong to logged in user
      const farmers = await Farmer.find({ user: req.user.id });
      
      // Get farmer IDs
      const farmerIds = farmers.map(farmer => farmer._id);
      
      // Find policies for these farmers
      query = InsurancePolicy.find({ farmer: { $in: farmerIds } });
    } else {
      query = InsurancePolicy.find();
    }
    
    // Execute query
    const policies = await query.populate({
      path: 'farmer',
      select: 'name aadhaarNumber contactNumber'
    });
    
    res.status(200).json({
      success: true,
      count: policies.length,
      data: policies
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get single policy
// @route   GET /api/v1/policies/:id
// @access  Private
exports.getPolicy = async (req, res, next) => {
  try {
    const policy = await InsurancePolicy.findById(req.params.id).populate({
      path: 'farmer',
      select: 'name aadhaarNumber contactNumber address bankDetails'
    });
    
    if (!policy) {
      return res.status(404).json({
        success: false,
        error: 'Policy not found'
      });
    }
    
    // If user is not admin, make sure they own the farmer
    if (req.user.role !== 'admin') {
      const farmer = await Farmer.findById(policy.farmer);
      
      if (!farmer || farmer.user.toString() !== req.user.id) {
        return res.status(401).json({
          success: false,
          error: 'Not authorized to access this policy'
        });
      }
    }
    
    res.status(200).json({
      success: true,
      data: policy
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Update policy
// @route   PUT /api/v1/policies/:id
// @access  Private
exports.updatePolicy = async (req, res, next) => {
  try {
    let policy = await InsurancePolicy.findById(req.params.id);
    
    if (!policy) {
      return res.status(404).json({
        success: false,
        error: 'Policy not found'
      });
    }
    
    // If user is not admin, make sure they own the farmer
    if (req.user.role !== 'admin') {
      const farmer = await Farmer.findById(policy.farmer);
      
      if (!farmer || farmer.user.toString() !== req.user.id) {
        return res.status(401).json({
          success: false,
          error: 'Not authorized to update this policy'
        });
      }
    }
    
    policy = await InsurancePolicy.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: policy
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Delete policy
// @route   DELETE /api/v1/policies/:id
// @access  Private
exports.deletePolicy = async (req, res, next) => {
  try {
    const policy = await InsurancePolicy.findById(req.params.id);
    
    if (!policy) {
      return res.status(404).json({
        success: false,
        error: 'Policy not found'
      });
    }
    
    // If user is not admin, make sure they own the farmer
    if (req.user.role !== 'admin') {
      const farmer = await Farmer.findById(policy.farmer);
      
      if (!farmer || farmer.user.toString() !== req.user.id) {
        return res.status(401).json({
          success: false,
          error: 'Not authorized to delete this policy'
        });
      }
    }
    
    await policy.remove();
    
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