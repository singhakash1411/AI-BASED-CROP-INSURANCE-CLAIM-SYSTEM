const express = require('express');
const {
  getClaims,
  getClaim,
  createClaim,
  updateClaim,
  deleteClaim,
  updateClaimStatus
} = require('../controllers/claims');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(protect, getClaims)
  .post(protect, createClaim);

router
  .route('/:id')
  .get(protect, getClaim)
  .put(protect, updateClaim)
  .delete(protect, deleteClaim);

router
  .route('/:id/status')
  .put(protect, authorize('admin'), updateClaimStatus);

module.exports = router; 