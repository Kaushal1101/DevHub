const express = require('express');
const router = express.Router();
const { createComp, getAllComps, getCompById } = require('../controller/compController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/comps
router.get('/', getAllComps);

// GET /api/comps/:id
router.get('/:id', getCompById);

// POST /api/comps
router.post('/', protect, createComp);

module.exports = router;