const express = require('express')
const passport = require('passport')
const router = express.Router()
const User = require('../models/userModel')
const axios = require('axios');
const { protect } = require('../middleware/authMiddleware');

const { getUserRepos, getRepoBranches, createBranch, commitProposalToBranch } = require('../controller/githubController');

// Redirect to github sign in page
// router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github',
  (req, res, next) => {
    // Get user id from url query
    const localUserId = req.query.userId;

    // Don't go to github without user ID
    if (!localUserId) {
      return res.redirect('http://localhost:5173/github-error');
    }

    // Pass state through so we can access it in callback request
    // Cannot put in session, gets wiped by github session
    passport.authenticate('github', {
      scope: ['repo', 'user:email'],
      state: localUserId
    })(req, res, next);
  }
);


// Request github again for access token 
router.get('/github/callback', 
  async (req, res, next) => {
    const localUserId = req.query.state;

    // Don't go to github callback without user ID
    if (!localUserId) return res.status(400).send('Missing local user ID');

    // Outside passport so it doesn't run if user doesn't exist
    const user = await User.findById(localUserId);
    if (!user) return res.status(404).send('User not found');

    passport.authenticate('github', { failureRedirect: '/' }, async (err, githubUser, info) => {
      if (err) return next(err);
      //console.log('RUNS');
  
      // Gets user from state passed earlier
      const localUserId = req.query.state
      if (!localUserId) return res.status(400).send('Missing local user ID');
    
      // Keep redirect at the end so test cases run properly
      if (!githubUser) return res.redirect('/');

      // console.log("USERNAME", githubUser.username);

      // Ensures same user doesn't create two accounts
      const originalUser = await User.findOne({ 'github.id': githubUser.id });

      if (originalUser && originalUser._id.toString() !== localUserId) {
        // console.log("OG IS: ", originalUser);
        // console.log("CURRENT IS: ", localUserId);
        return res.redirect('http://localhost:5173/github-error');
      }

      //console.log("THE TOKEN", githubUser.accessToken);
      // Puts github info in user DB
      user.github = {
        id: githubUser.id,
        username: githubUser.username,
        access_token: githubUser.accessToken
      }

      //console.log("USER GITHUB INFO", githubUser.accessToken);
  
      await user.save()

      res.redirect('http://localhost:5173/github-success');
    })
    (req, res, next)
  }
)


// @desc    Verify ownership of a GitHub repo
// @route   POST /api/github/verify-repo
// @access  Private

router.post('/verify-repo', async (req, res) => {
  const { owner } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Missing GitHub token' });

  try {
    // Find the user by GitHub token
    const user = await User.findOne({ 'github.access_token': token });

    if (!user || !user.github || !user.github.username) {
      return res.status(403).json({ message: 'GitHub user not linked or not found' });
    }

    // Check if the owner name matches the logged-in user's GitHub username
    if (owner.toLowerCase() !== user.github.username.toLowerCase()) {
      console.log("YES BLUD");
      return res.status(403).json({ message: 'You must be the owner of the repo to proceed.' });
    }

    // Owner matches
    res.status(200).json({ success: true, message: 'Verified ownership of repo' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/repos', getUserRepos);
router.get('/repos/:owner/:repo/branches', getRepoBranches);

router.post('/commit-proposal', protect, commitProposalToBranch);

module.exports = router