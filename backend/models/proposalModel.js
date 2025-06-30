// Import mongoose
const mongoose = require('mongoose')

// Create proposal model
const proposalSchema = new mongoose.Schema({
  feature: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Feature',
    required: true
  },
  proposer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please enter proposal title'],
  },
  desc: {
    type: String,
    required: [true, 'Please enter a short description of your proposal']
  },
  // Notes can be added by anyone part of the project
  notes: [String],
  mediaUrl: {
    type: String
  },
  githubUrl: {
    type: String
  },
  branchName: {
    type: String,
    default: 'main',
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
}, { timestamps: true });

module.exports = mongoose.model('Proposal', proposalSchema);