// Import express handler for async error handling
const asyncHandler = require('express-async-handler')

const Project = require('../models/projectModel');
const Feature = require('../models/featureModel');

// @desc    Get projects
// @route   GET /api/projects
// @access  Public
const getAllProjects = asyncHandler( async (req, res) => {
  const projects = await Project.find().populate('creator', 'username full_name role')

  res.status(200).json({ projects });
});

// @desc    Get projects by id
// @route   GET /api/projects/:id
// @access  Public
const getProjectById = asyncHandler( async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('creator', 'username full_name role')
    .populate('features', 'title desc')
    .populate('comments.user', 'username full_name');

    console.log('PROJECT HERE:', project)

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  res.status(200).json(project)
})

// @desc    Get user projects
// @route   GET /api/projects/user/:id
// @access  Public
const getUserProjects = asyncHandler( async (req, res) => {
  const userProjects = await Project.find({ creator: req.user._id }).populate('creator', 'username full_name role');

  res.status(200).json(userProjects)
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

// @desc    Create projects
// @routes  POST /api/projects
// @access  Private
const createProject = asyncHandler( async (req, res) => {
    // Extract required fields
    const {title, desc, access_type, tech_stack, 
        tags, features, github_repo, fileTree} = req.body

        // console.log("BLUD", req.user);

    // If no request body, or text in body, throw error
    if (!title || !desc || !req.user || !github_repo || !access_type) {
        res.status(400)
        throw new Error('Missing fields')
    }

    if (github_repo.url.endsWith('/')) {
      github_repo.url = github_repo.url.slice(0, -1);
    }

    // Create the project first
    const project = await Project.create({
        title,
        desc, 
        access_type,
        tech_stack, 
        tags, 
        creator: req.user._id, 
        github_repo: {
            ...github_repo,
            // Add branch to project repo info
            branch: github_repo.branch || 'main'
        },
        fileTree: buildFileTree(fileTree)
    });

    // Create feature objects for the project
    let featureList = [];
    for (const feature of features) {
      const { title, desc } = feature;
      // Description default if not provided by user
      let descToUse = desc || `Auto-created from project`;

      const newFeature = await Feature.create({
        title,
        creator: req.user._id,
        desc: descToUse,
        project: project._id
      });
      featureList.push(newFeature);
    }

    // Attach features to project
    // Only need feature id, not entire object
    project.features = featureList.map(f => f._id);
    await project.save();

    res.status(201).json(project);
});

// @desc    Delete projects
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProjects = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id).populate('creator', 'username full_name role')

    if (!project) {
      res.status(400);
      throw new Error('Project not found');
    }

    // Only project creator can delete
    if (project.creator._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await project.deleteOne();

    res.status(200).json({ message: `Project with id ${req.params.id} deleted`})
})

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProjects = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).populate('creator', 'username full_name role')

  if (!project) {
    res.status(400)
    throw new Error('Project not found')
  }

  if (project.creator._id.toString() !== req.user._id.toString()) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  }).populate('creator', 'username full_name role')

  res.status(200).json(updatedProject);
})


// @desc   Get my projects
// @route  GET /api/projects/my-projects
// @access Private
const getProjectsByLoggedInUser = asyncHandler(async (req, res) => {
  const projects = await Project.find({ creator: req.user._id }).populate('creator', 'username full_name role');
  res.status(200).json(projects);
})

// @desc    Add comment to project
// @route   POST /api/projects/:id/comments
// @access  Private
const addCommentToProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  if (!text || text.trim() === '') {
    return res.status(400).json({ message: 'Comment cannot be empty' });
  }

  const project = await Project.findById(id);
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  const newComment = {
    user: req.user._id,
    text,
    createdAt: new Date()
  };

  project.comments.push(newComment);
  await project.save();

  await project.populate('comments.user', 'username full_name');

  // Return the newly added comment
  res.status(201).json(project.comments[project.comments.length - 1]);
});


module.exports = {
  getAllProjects,
  createProject,
  deleteProjects,
  updateProjects,
  getProjectById, 
  getUserProjects,
  getProjectsByLoggedInUser,
  addCommentToProject
};