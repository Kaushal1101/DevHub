const mongoose = require('mongoose');

// Create comp entry model
const compEntrySchema = new mongoose.Schema({
  competition: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Comp', required: true 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', required: true 
  },
  repoUrl: { 
    type: String, 
    required: true 
  },
  notes: { 
    type: String 
  },
  votes: { 
    type: Number, 
    default: 0 
  },
  submittedAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('CompEntry', compEntrySchema);
