const express = require('express');
const {
  getFarmers,
  getFarmer,
  createFarmer,
  updateFarmer,
  deleteFarmer
} = require('../controllers/farmers');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(protect, authorize('admin'), getFarmers)
  .post(protect, createFarmer);

router
  .route('/:id')
  .get(protect, getFarmer)
  .put(protect, updateFarmer)
  .delete(protect, deleteFarmer);

module.exports = router; 