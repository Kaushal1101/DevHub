// Import express handler for async error handling
const asyncHandler = require('express-async-handler')
const Comp = require('../models/compModel');
const CompEntry = require('../models/compEntryModel');

// @route   POST /api/comps
// @desc    Create a new competition
// @access  Private
const createComp = asyncHandler(async (req, res) => {
  const { title, desc, submissionDeadline, votingDeadline } = req.body;

  if (!title || !submissionDeadline) {
    res.status(400);
    throw new Error('Missing title and deadline.');
  }

  // Ensure votingDeadline is at least 24 hours after submissionDeadline
  if (
    votingDeadline &&
    new Date(votingDeadline) - new Date(submissionDeadline) < 24 * 60 * 60 * 1000
  ) {
    res.status(400);
    throw new Error('Voting deadline must be at least 24 hours after submission deadline.');
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

// @desc    Get top 3 entries for a competition by vote count
// @route   GET /api/comps/:id/leaderboard
// @access  Public
const getCompLeaderboard = asyncHandler(async (req, res) => {
  const compId = req.params.id

  // Get top 3 only
  const topEntries = await CompEntry.find({ competition: compId }).sort({ votes: -1 }).limit(3).populate('user', 'username');

  res.json(topEntries);
});

// @desc    Finalize a competition by setting winners and closing 
// @route   PATCH /api/comps/:id/finalize
// @access  Private
const finalizeCompetition = asyncHandler(async (req, res) => {
  const comp = await Comp.findById(req.params.id);
  if (!comp) {
    res.status(404);
    throw new Error('Competition not found');
  }

  if (comp.status === 'closed') {
    res.status(400);
    throw new Error('Competition already finalized');
  }

  if (!comp.votingDeadline || new Date() < new Date(comp.votingDeadline)) {
    res.status(400);
    throw new Error('Voting period is not over yet');
  }

  const topEntries = await CompEntry.find({ competition: comp._id })
    .sort({ votes: -1 })
    .limit(3);

  comp.winners = topEntries.map(entry => entry._id);
  comp.status = 'closed';
  await comp.save();

  res.json({ message: 'Competition finalized', winners: comp.winners });
});

// @desc    Auto-close competitions after voting deadline
const autoCloseExpiredCompetitions = asyncHandler(async () => {
  const now = new Date();
  const compsToClose = await Comp.find({
    status: { $ne: 'closed' },
    votingDeadline: { $lte: now }
  });

  for (const comp of compsToClose) {
    const topEntries = await CompEntry.find({ competition: comp._id })
      .sort({ votes: -1 })
      .limit(3);

    comp.winners = topEntries.map(entry => entry._id);
    comp.status = 'closed';
    await comp.save();
  }
});

module.exports = {
  createComp,
  getAllComps,
  getCompById,
  getCompLeaderboard,
  finalizeCompetition,
  autoCloseExpiredCompetitions
};