const express = require('express');
const router = express.Router();

const { createCompEntry, getEntriesByCompetition, voteOnCompEntry } = require('../controller/compEntryController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/comp-entries
router.post('/', protect, createCompEntry);

// GET /api/comp-entries?competitionId=...
router.get('/', getEntriesByCompetition);

// PATCH /api/comp-entries/:entryId/vote
// Use patch since we're increasing the vote count which is already set
router.patch('/:entryId/vote', protect, voteOnCompEntry);

module.exports = router;