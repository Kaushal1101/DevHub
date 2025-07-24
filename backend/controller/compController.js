// Import express handler for async error handling
const asyncHandler = require('express-async-handler')
const Comp = require('../models/compModel');

// @route   POST /api/comps
// @desc    Create a new competition
// @access  Private
const createComp = asyncHandler(async (req, res) => {
  const { title, desc, submissionDeadline, votingDeadline } = req.body;

  if (!title || !submissionDeadline) {
    res.status(400);
    throw new Error('Missing title and deadline.');
  }

  const comp = await Comp.create({
    title,
    desc,
    creator: req.user._id,
    submissionDeadline,
    votingDeadline
  });

  res.status(201).json(comp);
});

// @route   GET /api/comps
// @desc    Get all competitions
// @access  Public
const getAllComps = asyncHandler(async (req, res) => {
  const comps = await Comp.find().populate('creator', 'username')
  res.json(comps);
});

// @desc    Get a competition by ID
// @route   GET /api/comps/:id
// @access  Public
const getCompById = asyncHandler(async (req, res) => {
  const comp = await Comp.findById(req.params.id).populate('creator', 'username');

  if (!comp) {
    res.status(404);
    throw new Error('Competition not found');
  }

  res.json(comp);
});

module.exports = {
  createComp,
  getAllComps,
  getCompById
};