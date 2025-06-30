const { getAllProposals, createProposal, getProposalsByFeature } = require('../controller/proposalController');
const express = require('express');
const router = express.Router();
const { getAllFeatures, getFeatureById, createFeature, updateFeature, deleteFeature } = require('../controller/featureController');
const { protect } = require('../middleware/authMiddleware');

// Proposal routes depend on feature, so it's included in feature routes

// POST /api/features/:featureId/proposals
router.route('/:featureId/proposals').post(protect, createProposal);

// GET /api/features/:featureId/proposals
router.route('/:featureId/proposals').get(getProposalsByFeature)

// GET /api/features
router.get('/', getAllFeatures);

// GET /api/features/:id
router.get('/:id', getFeatureById);

// POST /api/features
router.post('/', protect, createFeature);

// PUT /api/features/:id
router.put('/:id', protect, updateFeature);

// DELETE /api/features/:id
router.delete('/:id', protect, deleteFeature);

module.exports = router;