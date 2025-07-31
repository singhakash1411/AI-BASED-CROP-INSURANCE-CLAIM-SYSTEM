const Farmer = require('../models/Farmer');

// @desc    Create new farmer profile
// @route   POST /api/v1/farmers
// @access  Private
exports.createFarmer = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;
    
    // Check if farmer profile already exists for this user
    const existingFarmer = await Farmer.findOne({ user: req.user.id });
    
    if (existingFarmer) {
      return res.status(400).json({
        success: false,
        error: 'User already has a farmer profile'
      });
    }
    
    const farmer = await Farmer.create(req.body);
    
    res.status(201).json({
      success: true,
      data: farmer
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get all farmers
// @route   GET /api/v1/farmers
// @access  Private/Admin
exports.getFarmers = async (req, res, next) => {
  try {
    const farmers = await Farmer.find().populate('user', 'username email');
    
    res.status(200).json({
      success: true,
      count: farmers.length,
      data: farmers
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get single farmer
// @route   GET /api/v1/farmers/:id
// @access  Private
exports.getFarmer = async (req, res, next) => {
  try {
    const farmer = await Farmer.findById(req.params.id).populate('user', 'username email');
    
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
        error: 'Not authorized to access this farmer profile'
      });
    }
    
    res.status(200).json({
      success: true,
      data: farmer
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Update farmer
// @route   PUT /api/v1/farmers/:id
// @access  Private
exports.updateFarmer = async (req, res, next) => {
  try {
    let farmer = await Farmer.findById(req.params.id);
    
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
        error: 'Not authorized to update this farmer profile'
      });
    }
    
    farmer = await Farmer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: farmer
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Delete farmer
// @route   DELETE /api/v1/farmers/:id
// @access  Private
exports.deleteFarmer = async (req, res, next) => {
  try {
    const farmer = await Farmer.findById(req.params.id);
    
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
        error: 'Not authorized to delete this farmer profile'
      });
    }
    
    await farmer.remove();
    
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