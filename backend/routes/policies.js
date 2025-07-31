const express = require('express');
const {
  getPolicies,
  getPolicy,
  createPolicy,
  updatePolicy,
  deletePolicy
} = require('../controllers/policies');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(protect, getPolicies)
  .post(protect, createPolicy);

router
  .route('/:id')
  .get(protect, getPolicy)
  .put(protect, updatePolicy)
  .delete(protect, deletePolicy);

module.exports = router; 