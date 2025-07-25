const express = require('express');
const router = express.Router();
const { createComp, getAllComps, getCompById, getCompLeaderboard, finalizeCompetition } = require('../controller/compController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/comps
router.get('/', getAllComps);

// GET /api/comps/:id
router.get('/:id', getCompById);

// GET /api/comps/:id/leaderboard
router.get('/:id/leaderboard', getCompLeaderboard);

// PATCH /api/comps/:id/finalize
router.patch('/:id/finalize', protect, finalizeCompetition);

// POST /api/comps
router.post('/', protect, createComp);

module.exports = router;