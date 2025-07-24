const mongoose = require('mongoose');

// Create competition model
const compSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  desc: { 
    type: String 
  },
  creator: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', required: true 
  },
  submissionDeadline: { 
    type: Date, 
    required: true 
  },
  votingDeadline: { type: Date },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  },
  winners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CompEntry' }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Comp', compSchema);
