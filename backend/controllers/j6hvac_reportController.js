const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');
const J6HVACReportService = require('../services/j6hvac_reportService');

// @desc    Generate J6 HVAC report for a project
// @route   GET /api/j6hvac/:id/report
// @access  Private
const generateJ6hvacReport = asyncHandler(async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    const sectionType = req.query.sectionType || 'j6hvac';

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

    const reportService = new J6HVACReportService(project);
    const report = await reportService.generateReport();

    return res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error in generateJ6hvacReport:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = {
  generateJ6hvacReport
}; 