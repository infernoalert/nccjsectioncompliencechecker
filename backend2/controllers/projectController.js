const Project = require('../models/project.model');
const asyncHandler = require('express-async-handler');

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const createProject = asyncHandler(async (req, res) => {
  const {
    name,
    buildingType,
    location,
    climateZone,
    totalArea,
    totalHabitableArea,
    buildingFabric,
    specialRequirements,
    exemptions
  } = req.body;

  const project = await Project.create({
    name,
    buildingType,
    location,
    climateZone,
    totalArea,
    totalHabitableArea,
    buildingFabric,
    specialRequirements,
    exemptions,
    user: req.user._id
  });

  res.status(201).json(project);
});

// @desc    Get all projects for a user
// @route   GET /api/projects
// @access  Private
const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ user: req.user._id });
  res.json(projects);
});

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  // Check for user
  if (project.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  res.json(project);
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  // Check for user
  if (project.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const updatedProject = await Project.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(updatedProject);
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  // Check for user
  if (project.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  await project.remove();
  res.json({ message: 'Project removed' });
});

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject
}; 