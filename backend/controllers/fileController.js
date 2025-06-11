const multer = require('multer');
const path = require('path');
const fs = require('fs');
const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');
const { model: File } = require('../models/File');

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
    console.log('Project not found for ID:', req.params.id);
    return res.status(404).json({
      success: false,
      error: 'Project not found'
    });
  }

  // Check if user is the owner
  if (project.owner.toString() !== req.user._id.toString()) {
    console.log('Unauthorized upload attempt by user:', req.user._id, 'for project:', req.params.id);
    return res.status(401).json({
      success: false,
      error: 'Not authorized to upload files for this project'
    });
  }

  // Handle file upload
  upload.single('file')(req, res, async (err) => {
    if (err) {
      console.log('Multer error:', err);
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }

    if (!req.file) {
      console.log('No file uploaded in request');
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    try {
      // Store relative path for portability
      const relativePath = path.relative(process.cwd(), req.file.path).replace(/\\/g, '/');
      // Create a new File document
      const fileDoc = await File.create({
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: relativePath,
        size: req.file.size,
        mimetype: req.file.mimetype
      });
      console.log('Created File document:', fileDoc);

      // Add file reference to project
      project.files.push(fileDoc._id);
      await project.save();
      console.log('Updated Project with new file:', project);

      console.log('Returning file in response:', fileDoc);
      res.status(200).json({
        success: true,
        data: {
          file: fileDoc
        }
      });
    } catch (error) {
      // Clean up the uploaded file if database operation fails
      fs.unlinkSync(req.file.path);
      console.log('Error during file upload, cleaned up file:', req.file.path, 'Error:', error);
      throw error;
    }
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

  const file = await File.findOne({ filename: req.params.filename });

  if (!file) {
    return res.status(404).json({
      success: false,
      error: 'File not found'
    });
  }

  res.sendFile(path.resolve(process.cwd(), file.path));
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

  const file = await File.findOne({ filename: req.params.filename });

  if (!file) {
    return res.status(404).json({
      success: false,
      error: 'File not found'
    });
  }

  // Delete file from filesystem
  fs.unlinkSync(path.resolve(process.cwd(), file.path));

  // Remove file reference from project
  project.files = project.files.filter(f => f.toString() !== file._id.toString());
  await project.save();

  // Delete file document
  await file.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
}); 