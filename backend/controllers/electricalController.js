const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');

// @desc    Get electrical data for a project
// @route   GET /api/projects/:id/electrical
// @access  Private
exports.getProjectElectrical = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  
  if (!project) {
    return res.status(404).json({
      success: false,
      error: 'Project not found'
    });
  }

  // Check if user owns the project or is an admin
  if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this project'
    });
  }

  res.status(200).json({
    success: true,
    data: project.electrical
  });
}); 