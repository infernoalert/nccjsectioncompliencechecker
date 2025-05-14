const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');
const LightingPowerReportService = require('../services/lighting_power_reportService');

// @desc    Generate lighting & power report for a project
// @route   GET /api/j9monitoring/:id/report
// @access  Private
exports.generateLightingPowerReport = asyncHandler(async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    const sectionType = req.query.sectionType || 'j9monitoring';

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

    const reportService = new LightingPowerReportService(project);
    const report = await reportService.generateReport(sectionType);

    return res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error in generateLightingPowerReport:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}); 