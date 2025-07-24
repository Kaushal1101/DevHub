const mongoose = require('mongoose');

// Create vote model
const voteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  entry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CompEntry',
    required: true
  },
  votedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensures one user has only one vote per entry
// Prevents some other backend error leading to multiple/infinite votes
voteSchema.index({ user: 1, entry: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);