// controller/githubController.js
const axios = require('axios');

const Proposal = require('../models/proposalModel');
const Feature = require('../models/featureModel');
const Project = require('../models/projectModel');

// @desc    Verifies if the user owns the GitHub repo
// @route   POST /api/github/verify-repo
// @access  Private
const verifyRepo = async (req, res) => {
  const { owner, repo } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Missing token' });
  }

  try {
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: { Authorization: `token ${token}` },
    });

    res.status(200).json({ valid: true });
  } catch (err) {
    res.status(403).json({ valid: false, message: 'Unauthorized or repo not found' });
  }
};

// @desc    Get list of repos for authenticated GitHub user
// @route   GET /api/github/repos
// @access  Private
const getUserRepos = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Missing token' });
  }

  try {
    const response = await axios.get('https://api.github.com/user/repos', {
      headers: { Authorization: `token ${token}` }
    });

    res.status(200).json(response.data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch repositories', error: err.message });
  }
};

// @desc    Get list of branches for a specific repo
// @route   GET /api/github/repos/:owner/:repo/branches
// @access  Private
const getRepoBranches = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { owner, repo } = req.params;

  if (!token) {
    return res.status(401).json({ message: 'Missing token' });
  }

  try {
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/branches`, {
      headers: { Authorization: `token ${token}` }
    });

    res.status(200).json(response.data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch branches', error: err.message });
  }
};


// @desc    Commit a file to a branch in a GitHub repo
// @route   POST /api/github/commit-proposal
// @access  Private
const commitProposalToBranch = async (req, res) => {
  const userId = req.user.id;
  const user = await require('../models/userModel').findById(userId);
  const token = user?.github?.access_token;

  // Get proposal along with the feature it's under
  const proposalId = req.body.proposalId;
  const proposal = await Proposal.findById(proposalId).select('feature');   // { feature: ObjectId }
  if (!proposal) throw new Error('Proposal not found');


  // Get project repo that we want to commit to
  const feature = await Feature.findById(proposal.feature).populate('project', 'github_repo'); 
  if (!feature || !feature.project) throw new Error('Feature or linked project not found');

  console.log("FT", feature);
  const { owner: projectOwner, repo: projectRepo, branch: projectBranch } = feature.project.github_repo;
  if (!projectBranch) projectBranch = 'main';

  console.log("CHECK", projectOwner, projectBranch);

  const {
    proposalOwner,
    proposalName,
    // Rename to proposalBranch to diffrentiate with projectBranch
    branchName: proposalBranch,
    content,
    commitMessage,
  } = req.body;

  if (!token) {
    return res.status(401).json({ message: 'Missing token' });
  }

  if (!token || !user?.github?.username) {
    return res.status(403).json({ message: 'GitHub token or username not found' });
  }

  try {
    // Get latest commit made on project repo
    const targetRef = await axios.get(
      `https://api.github.com/repos/${projectOwner}/${projectRepo}/git/ref/heads/${projectBranch}`,
      { headers: { Authorization: `token ${token}` } }
    );
    const targetLatestSha = targetRef.data.object.sha;

    // Get latest commit of the proposal repo
    const proposalRef = await axios.get(
      `https://api.github.com/repos/${proposalOwner}/${proposalName}/git/ref/heads/${proposalBranch}`,
      { headers: { Authorization: `token ${token}` } }
    );
    const proposalCommitSha = proposalRef.data.object.sha;

    // Get tree SHA of folder and files in proposal
    const proposalCommit = await axios.get(
      `https://api.github.com/repos/${proposalOwner}/${proposalName}/git/commits/${proposalCommitSha}`,
      { headers: { Authorization: `token ${token}` } }
    );
    const proposalTreeSha = proposalCommit.data.tree.sha;

    // Fetch the full tree from the proposal repo
    const proposalTreeResp = await axios.get(
      `https://api.github.com/repos/${proposalOwner}/${proposalName}/git/trees/${proposalTreeSha}?recursive=1`,
      { headers: { Authorization: `token ${token}` } }
    );

    // Re‑create each blob/file inside the project repo
    const treeEntries = [];

    for (const item of proposalTreeResp.data.tree) {
      // Skip folders since they can't be directly downloaded
      if (item.type !== 'blob') continue;     

      // Download blob content from proposal repo
      const blobContentResp = await axios.get(
        `https://api.github.com/repos/${proposalOwner}/${proposalName}/git/blobs/${item.sha}`,
        { headers: { Authorization: `token ${token}` } }
      );

      const { content: base64Content, encoding } = blobContentResp.data;

      // Upload this blob into project repo
      const newBlobResp = await axios.post(
        `https://api.github.com/repos/${projectOwner}/${projectRepo}/git/blobs`,
        {
          content: base64Content,
          encoding: 'base64',
        },
        { headers: { Authorization: `token ${token}` } }
      );

      // Add blob to tree structure which gets pushed to project later
      treeEntries.push({
        path: item.path,
        mode: '100644',
        type: 'blob',
        sha: newBlobResp.data.sha,
      });
    }

    // Create new tree inside the project repo to mirror proposal
    const projectTreeRes = await axios.post(
      `https://api.github.com/repos/${projectOwner}/${projectRepo}/git/trees`,
      { tree: treeEntries },
      { headers: { Authorization: `token ${token}` } }
    );

    // Get SHA of project tree just created for new commit
    const projectTreeSha = projectTreeRes.data.sha;

    // Create commit in the project repo using this tree
    const newCommitRes = await axios.post(
      `https://api.github.com/repos/${projectOwner}/${projectRepo}/git/commits`,
      {
        message: commitMessage || `Import proposal ${proposalName}`,
        tree: projectTreeSha,     
        parents: [targetLatestSha],
      },
      { headers: { Authorization: `token ${token}` } }
    );

    // Get SHA of new latest commit
    const newCommitSha = newCommitRes.data.sha;

    // Update the project branch pointer to new commit
    await axios.patch(
      `https://api.github.com/repos/${projectOwner}/${projectRepo}/git/refs/heads/${projectBranch}`,
      { sha: newCommitSha },
      { headers: { Authorization: `token ${token}` } }
    );

    res.status(200).json({ message: 'Proposal imported successfully' });
    console.log('Success: Imported full tree from proposal repo into project repo.');

  } catch (err) {
    console.error('Import error:', err?.response?.data || err.message);
    res.status(500).json({ message: 'Failed to import proposal', error: err.message })
  }
};

// @desc    Get GitHub access token for the logged-in user
// @route   GET /api/github/token
// @access  Private
const getGithubToken = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await require('../models/userModel').findById(userId);
    if (!user || !user.github || !user.github.access_token) {
      return res.status(404).json({ message: 'GitHub token not found' });
    }
    res.status(200).json({ access_token: user.github.access_token });
  } catch (err) {
    console.error('Error fetching GitHub token:', err.message);
    res.status(500).json({ message: 'Failed to fetch GitHub token' });
  }
};

module.exports = {
  verifyRepo,
  getUserRepos,
  getRepoBranches,
  commitProposalToBranch,
  getGithubToken
};