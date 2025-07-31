const express = require('express');
const multer = require('multer');
const path = require('path');
const { protect, authorize } = require('../middleware/auth');
const {
  submitApplication,
  getApplications,
  getApplication,
  updateApplication
} = require('../controllers/insurance');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images (jpeg, jpg, png) and PDFs only!');
    }
  }
});

// Configure multiple file uploads
const uploadFields = upload.fields([
  { name: 'aadharCard', maxCount: 1 },
  { name: 'landDocument', maxCount: 1 },
  { name: 'bankDocument', maxCount: 1 },
  { name: 'gpsImages', maxCount: 5 },
  { name: 'farmPhotos', maxCount: 5 }
]);

router
  .route('/')
  .post(protect, uploadFields, submitApplication)
  .get(protect, authorize('admin'), getApplications);

router
  .route('/:id')
  .get(protect, getApplication)
  .put(protect, authorize('admin'), updateApplication);

module.exports = router; 