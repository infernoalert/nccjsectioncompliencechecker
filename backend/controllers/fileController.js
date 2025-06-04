const multer = require('multer');
const path = require('path');
const fs = require('fs');
const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to only allow PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

// Configure multer upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  }
});

// @desc    Upload a file for a project
// @route   POST /api/projects/:id/upload
// @access  Private
exports.uploadFile = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({
      success: false,
      error: 'Project not found'
    });
  }

  // Check if user is the owner
  if (project.owner.toString() !== req.user._id.toString()) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to upload files for this project'
    });
  }

  // Handle file upload
  upload.single('file')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Add file information to project
    project.files.push({
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    await project.save();

    res.status(200).json({
      success: true,
      data: {
        file: project.files[project.files.length - 1]
      }
    });
  });
});

// @desc    Get a file for a project
// @route   GET /api/projects/:id/files/:filename
// @access  Private
exports.getFile = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({
      success: false,
      error: 'Project not found'
    });
  }

  // Check if user is the owner
  if (project.owner.toString() !== req.user._id.toString()) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access files for this project'
    });
  }

  const file = project.files.find(f => f.filename === req.params.filename);

  if (!file) {
    return res.status(404).json({
      success: false,
      error: 'File not found'
    });
  }

  res.sendFile(file.path);
});

// @desc    Delete a file from a project
// @route   DELETE /api/projects/:id/files/:filename
// @access  Private
exports.deleteFile = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({
      success: false,
      error: 'Project not found'
    });
  }

  // Check if user is the owner
  if (project.owner.toString() !== req.user._id.toString()) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to delete files for this project'
    });
  }

  const fileIndex = project.files.findIndex(f => f.filename === req.params.filename);

  if (fileIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'File not found'
    });
  }

  // Delete file from filesystem
  const file = project.files[fileIndex];
  fs.unlinkSync(file.path);

  // Remove file from project
  project.files.splice(fileIndex, 1);
  await project.save();

  res.status(200).json({
    success: true,
    data: {}
  });
}); 