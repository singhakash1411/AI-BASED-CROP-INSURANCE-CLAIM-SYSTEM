const Insurance = require('../models/Insurance');
const path = require('path');
const fs = require('fs');

// @desc    Submit insurance application
// @route   POST /api/v1/insurance
// @access  Private
exports.submitApplication = async (req, res) => {
  try {
    // Handle file uploads
    const files = req.files;
    const fileUrls = {};

    if (!files) {
      return res.status(400).json({
        success: false,
        error: 'Please upload all required documents'
      });
    }

    // Process document uploads
    if (files.aadharCard) {
      fileUrls.aadharCard = `/uploads/${files.aadharCard[0].filename}`;
    }
    if (files.landDocument) {
      fileUrls.landDocument = `/uploads/${files.landDocument[0].filename}`;
    }
    if (files.bankDocument) {
      fileUrls.bankDocument = `/uploads/${files.bankDocument[0].filename}`;
    }

    // Process GPS and farm photos
    const gpsImages = [];
    const farmPhotos = [];

    if (files.gpsImages) {
      files.gpsImages.forEach(file => {
        gpsImages.push(`/uploads/${file.filename}`);
      });
    }

    if (files.farmPhotos) {
      files.farmPhotos.forEach(file => {
        farmPhotos.push(`/uploads/${file.filename}`);
      });
    }

    // Create insurance application
    const application = await Insurance.create({
      user: req.user.id,
      farmerName: req.body.farmerName,
      aadharNumber: req.body.aadharNumber,
      phoneNumber: req.body.phoneNumber,
      address: req.body.address,
      landArea: req.body.landArea,
      cropType: req.body.cropType,
      soilType: req.body.soilType,
      irrigationSource: req.body.irrigationSource,
      aadharCard: fileUrls.aadharCard,
      landDocument: fileUrls.landDocument,
      bankDocument: fileUrls.bankDocument,
      gpsImages,
      farmPhotos
    });

    res.status(201).json({
      success: true,
      data: application
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get all applications
// @route   GET /api/v1/insurance
// @access  Private/Admin
exports.getApplications = async (req, res) => {
  try {
    const applications = await Insurance.find().populate('user', 'username email');

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get single application
// @route   GET /api/v1/insurance/:id
// @access  Private
exports.getApplication = async (req, res) => {
  try {
    const application = await Insurance.findById(req.params.id).populate('user', 'username email');

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    // Check if user is owner or admin
    if (application.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this application'
      });
    }

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Update application status
// @route   PUT /api/v1/insurance/:id
// @access  Private/Admin
exports.updateApplication = async (req, res) => {
  try {
    let application = await Insurance.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    application = await Insurance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
}; 