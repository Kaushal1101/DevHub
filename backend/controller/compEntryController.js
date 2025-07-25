// Import express handler for async error handling
const asyncHandler = require('express-async-handler');
const CompEntry = require('../models/compEntryModel');
const Comp = require('../models/compModel');
const Vote = require('../models/voteModel')
const mongoose = require('mongoose');

// @desc    Submit a repo to a competition
// @route   POST /api/comp-entries
// @access  Private
const createCompEntry = asyncHandler(async (req, res) => {
  const { competition, repoUrl, notes } = req.body;

  if (!competition || !repoUrl) {
    res.status(400);
    throw new Error('Competition ID and repo URL are required');
  }

  const comp = await Comp.findById(competition);

  if (!comp) {
    res.status(404);
    throw new Error('Competition not found');
  }

  // Make sure cannot submit entry after deadline
  if (comp.submissionDeadline && new Date() > new Date(comp.submissionDeadline)) {
    res.status(400);
    throw new Error('Submission deadline is over');
  }

  const entry = await CompEntry.create({
    competition,
    user: req.user._id,
    repoUrl,
    notes
  });

  res.status(201).json(entry);
});

// @route   GET /api/comp-entries?competitionId=...
// @desc    Get all entries for a competition
// @access  Public
const getEntriesByCompetition = asyncHandler(async (req, res) => {
  if (!req.query.competitionId) {
    res.status(400);
    throw new Error('Competition ID is required as a query parameter');
  }
  const competitionId = new mongoose.Types.ObjectId(req.query.competitionId);
  const entries = await CompEntry.find({ competition: competitionId })
    .populate('user', 'username')
    .sort({ votes: -1 });

  res.json(entries);
});

// @desc    Vote on a competition entry
// @route   PATCH /api/comp-entries/:entryId/vote
// @access  Private
const voteOnCompEntry = asyncHandler(async (req, res) => {
  const existingVote = await Vote.findOne({
    user: req.user._id,
    entry: req.params.entryId
  });

  if (existingVote) {
    res.status(400);
    throw new Error('You have already voted for this entry');
  }

  const entry = await CompEntry.findById(req.params.entryId);
  if (!entry) {
    res.status(404);
    throw new Error('Entry not found');
  }

  const competition = await Comp.findById(entry.competition);
  if (!competition) {
    res.status(404);
    throw new Error('Competition not found');
  }

  // Voting deadline different from submission deadline
  if (competition.votingDeadline && new Date() > competition.votingDeadline) {
    res.status(400);
    throw new Error('Voting period has ended');
  }

  await Vote.create({
    user: req.user._id,
    entry: req.params.entryId
  });

  const voteCount = await Vote.countDocuments({ entry: req.params.entryId });
  entry.votes = voteCount;
  await entry.save();

  res.json({ message: 'Vote counted', votes: voteCount });
});

const deleteCompEntry = asyncHandler(async (req, res) => {
  const entry = await CompEntry.findById(req.params.entryId);
  if (!entry) {
    res.status(404);
    throw new Error('Entry not found');
  }

  const comp = await Comp.findById(entry.competition);
  if (!comp) {
    res.status(404);
    throw new Error('Competition not found');
  }

  if (comp.submissionDeadline && new Date() > new Date(comp.submissionDeadline)) {
    res.status(400);
    throw new Error('Cannot delete entry after submission deadline');
  }

  if (entry.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You are not authorized to delete this entry');
  }

  await entry.deleteOne();
  res.json({ message: 'Entry deleted successfully' });
});

// @desc    Get competition by ID
// @route   GET /api/comps/:id
// @access  Public
const getCompById = asyncHandler(async (req, res) => {
  const comp = await Comp.findById(req.params.id).populate('winners');
  if (!comp) {
    res.status(404);
    throw new Error('Competition not found');
  }

  // Compute flags to make frontend logic easier later
  // Keeps abstraction barrier, good API practice
  const now = new Date();
  const isFinalized = comp.status === 'closed';
  const canSubmit = !comp.submissionDeadline || now < new Date(comp.submissionDeadline);
  const canVote = !isFinalized && (!comp.votingDeadline || now < new Date(comp.votingDeadline));

  res.json({
    ...comp.toObject(), // Get all other info
    isFinalized,     // True if winners finalized
    canSubmit,       // True if submission still open
    canVote          // True if voting still allowed
  });
});

module.exports = {
  createCompEntry,
  getEntriesByCompetition,
  voteOnCompEntry,
  deleteCompEntry,
  getCompById
};