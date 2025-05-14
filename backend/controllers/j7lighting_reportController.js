const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');
const J7LightingReportService = require('../services/j7lighting_reportService');

// @desc    Generate J7 Lighting & Power report for a project
// @route   GET /api/j7lighting/:id/report
// @access  Private
const generateJ7LightingReport = asyncHandler(async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    const sectionType = req.query.sectionType || 'j7lighting';

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

    const reportService = new J7LightingReportService(project);
    const report = await reportService.generateReport();

    return res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error in generateJ7LightingReport:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = {
  generateJ7LightingReport
}; 