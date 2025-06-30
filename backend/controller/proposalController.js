// Import express handler for async error handling
const asyncHandler = require('express-async-handler');

const Proposal = require('../models/proposalModel');
const Feature = require('../models/featureModel');

// Routes tied to features to indicate each proposal is under a single feature

// @route   GET /api/features/:featureId/proposals
// @desc    Get all proposals for a specific feature
// @access  Public
const getProposalsByFeature = asyncHandler(async (req, res) => {
  try {
    const proposals = await Proposal.find({
      feature: req.params.featureId
    }).populate('proposer', 'username full_name role');

    //console.log("THE PROPOSALS BLUD:", proposals);

    res.status(200).json({ proposals });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


// @route   GET /api/proposals/:id
// @desc    Get proposals by id
// @access  Public
const getProposalById = asyncHandler( async (req, res) => {
  const proposal = await Proposal.findById(req.params.id).populate('proposer', 'username full_name role');

  if (!proposal) {
    res.status(404);
    throw new Error('Proposal not found');
  }

  res.status(200).json(proposal)
})


// @route   GET /api/proposals/user
// @desc    Get user proposals
// @access  Public
const getUserProposals = asyncHandler( async (req, res) => {
  const userProposals = await Proposal.find({ proposer: req.user._id }).populate('proposer', 'username full_name role');

  res.status(200).json(userProposals)
})


// Builds tree using flat raw tree structure
const buildFileTree = (flatTree) => {
  const root = [];
  const pathMap = {};

  // Iterate over each file/folder
  flatTree.forEach(item => {
    // Split each path into parts of folders
    const parts = item.path.split('/');
    let current = root;

    parts.forEach((part, i) => {
      // Recreate path to use as key for hashmap (pathmap)
      const pathBuilder = parts.slice(0, i + 1).join('/');
      
      // Check if node exists using hashmap to get O(1) check
      // If doesn't exist, create new node
      if (!pathMap[pathBuilder]) {
        const newNode = {
          name: part,
          path: pathBuilder,
          type: (i === parts.length - 1) ? item.type : 'tree',
          children: []
        };
        pathMap[pathBuilder] = newNode;

        // Initialize root if undefined
        if (i === 0) {
          root.push(newNode);
        } else {
          const parentPath = parts.slice(0, i).join('/');
          pathMap[parentPath].children.push(newNode);
        }
      }
    });
  });

  return root;
};


// @route   POST /api/features/:featureId/proposals
// @desc    Create proposals
// @access  Private
const createProposal = asyncHandler( async (req, res) => {
    const { title, desc, notes, attachmentUrl, githubUrl, feature, branchName } = req.body;
    let status = req.body.status || "Pending";

    // console.log("BLUD", req.user);

    // If no request body, or text in body, throw error
    if (!feature || !req.user || !title || !desc) {
        res.status(400)
        throw new Error('Missing fields')
    }

    //console.log("RAW INFO", title, desc, github_repo);
    const proposal = await Proposal.create({
       feature, 
       proposer: req.user._id, 
       title, 
       desc, 
       notes, 
       attachmentUrl, 
       githubUrl,
       branchName: branchName || 'main',
       status
    });

    // Add proposal to feature
    const featureBody = await Feature.findById(feature);
    if (featureBody) {
      featureBody.proposals.push(proposal._id);
      await featureBody.save();
    }

    // console.log("PROPOSAL", proposal);

    res.status(201).json(proposal);
});


// @route   DELETE /api/proposals/:id
// @desc    Delete proposals
// @access  Private
const deleteProposal = asyncHandler(async (req, res) => {
    const proposal = await Proposal.findById(req.params.id).populate('proposer', 'username full_name role');

    if (!proposal) {
      res.status(400);
      throw new Error('Proposal not found');
    };

    // Only proposal creator can delete the proposal for now
    if (proposal.proposer._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    };

    // Remove the proposal from the associated feature
    await Feature.findByIdAndUpdate(
      proposal.feature,
      { $pull: { proposals: proposal._id } },
      { new: true }
    );

    await proposal.deleteOne();

    res.status(200).json({ message: `Proposal with id ${req.params.id} deleted` });
});


/* 

No update feature for proposals for now

// @route   PUT /api/proposals/:id
// @desc    Update proposal
// @access  Private
const updateProposals = asyncHandler(async (req, res) => {
  const proposal = await Proposal.findById(req.params.id).populate('proposer', 'username full_name role')
  if (!proposal) {
    res.status(400)
    throw new Error('Proposal not found')
  }

  if (proposal.proposer._id.toString() !== req.user._id.toString()) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  const updatedProposal = await Proposal.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  }).populate('proposer', 'username full_name role')

  res.status(200).json(updatedProposal);
})

*/

module.exports = {
  createProposal,
  deleteProposal,
  //updateProposals,
  getProposalById, 
  getUserProposals,
  getProposalsByFeature
};