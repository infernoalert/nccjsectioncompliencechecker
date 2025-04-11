const CompliancePathway = require('../models/CompliancePathway');
const asyncHandler = require('express-async-handler');

// @desc    Get all compliance pathways
// @route   GET /api/compliance-pathways
// @access  Public
const getCompliancePathways = asyncHandler(async (req, res) => {
  const compliancePathways = await CompliancePathway.find({});
  res.status(200).json(compliancePathways);
});

// @desc    Get a single compliance pathway
// @route   GET /api/compliance-pathways/:id
// @access  Public
const getCompliancePathway = asyncHandler(async (req, res) => {
  const compliancePathway = await CompliancePathway.findById(req.params.id);
  
  if (!compliancePathway) {
    res.status(404);
    throw new Error('Compliance pathway not found');
  }
  
  res.status(200).json(compliancePathway);
});

// @desc    Create a compliance pathway
// @route   POST /api/compliance-pathways
// @access  Private/Admin
const createCompliancePathway = asyncHandler(async (req, res) => {
  const compliancePathway = await CompliancePathway.create(req.body);
  res.status(201).json(compliancePathway);
});

// @desc    Update a compliance pathway
// @route   PUT /api/compliance-pathways/:id
// @access  Private/Admin
const updateCompliancePathway = asyncHandler(async (req, res) => {
  const compliancePathway = await CompliancePathway.findById(req.params.id);
  
  if (!compliancePathway) {
    res.status(404);
    throw new Error('Compliance pathway not found');
  }
  
  const updatedCompliancePathway = await CompliancePathway.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  res.status(200).json(updatedCompliancePathway);
});

// @desc    Delete a compliance pathway
// @route   DELETE /api/compliance-pathways/:id
// @access  Private/Admin
const deleteCompliancePathway = asyncHandler(async (req, res) => {
  const compliancePathway = await CompliancePathway.findById(req.params.id);
  
  if (!compliancePathway) {
    res.status(404);
    throw new Error('Compliance pathway not found');
  }
  
  await compliancePathway.remove();
  
  res.status(200).json({ message: 'Compliance pathway removed' });
});

module.exports = {
  getCompliancePathways,
  getCompliancePathway,
  createCompliancePathway,
  updateCompliancePathway,
  deleteCompliancePathway
}; 