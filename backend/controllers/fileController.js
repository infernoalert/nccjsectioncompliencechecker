const fileStorageService = require('../services/fileStorageService');
const Project = require('../models/Project');
const asyncHandler = require('express-async-handler');

// @desc    Upload file to project
// @route   POST /api/projects/:id/files
// @access  Private
exports.uploadFile = asyncHandler(async (req, res) => {
    try {
        console.log('File upload request received:', {
            projectId: req.params.id,
            file: req.file ? {
                originalname: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype,
                buffer: req.file.buffer ? 'Buffer exists' : 'No buffer'
            } : 'No file'
        });

        const projectId = req.params.id;
        const file = req.file;

        if (!file) {
            console.error('No file uploaded');
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        // Check if project exists and user has access
        const project = await Project.findOne({
            _id: projectId,
            owner: req.user.id
        });

        if (!project) {
            console.error('Project not found:', projectId);
            return res.status(404).json({
                success: false,
                error: 'Project not found or access denied'
            });
        }

        // Save file and get metadata
        const fileMetadata = await fileStorageService.saveFile(projectId, file);
        console.log('File saved successfully:', fileMetadata);

        // Add file to project's files array
        project.files.push(fileMetadata);
        await project.save();
        console.log('Project updated with file metadata');

        res.status(201).json({
            success: true,
            data: fileMetadata
        });
    } catch (error) {
        console.error('Error in uploadFile controller:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @desc    Get all files for a project
// @route   GET /api/projects/:id/files
// @access  Private
exports.getFiles = asyncHandler(async (req, res) => {
    const projectId = req.params.id;

    // Check if project exists and user has access
    const project = await Project.findOne({
        _id: projectId,
        owner: req.user.id
    });

    if (!project) {
        return res.status(404).json({
            success: false,
            error: 'Project not found or access denied'
        });
    }

    res.json({
        success: true,
        data: project.files
    });
});

// @desc    Delete file from project
// @route   DELETE /api/projects/:id/files/:fileId
// @access  Private
exports.deleteFile = asyncHandler(async (req, res) => {
    const { id: projectId, fileId } = req.params;

    // Check if project exists and user has access
    const project = await Project.findOne({
        _id: projectId,
        owner: req.user.id
    });

    if (!project) {
        return res.status(404).json({
            success: false,
            error: 'Project not found or access denied'
        });
    }

    // Find file in project
    const file = project.files.id(fileId);
    if (!file) {
        return res.status(404).json({
            success: false,
            error: 'File not found'
        });
    }

    try {
        // Delete file from storage
        await fileStorageService.deleteFile(projectId, file.name);

        // Remove file from project's files array
        project.files.pull(fileId);
        await project.save();

        res.json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// @desc    Download file
// @route   GET /api/projects/:id/files/:fileId
// @access  Private
exports.downloadFile = asyncHandler(async (req, res) => {
    const { id: projectId, fileId } = req.params;

    // Check if project exists and user has access
    const project = await Project.findOne({
        _id: projectId,
        owner: req.user.id
    });

    if (!project) {
        return res.status(404).json({
            success: false,
            error: 'Project not found or access denied'
        });
    }

    // Find file in project
    const file = project.files.id(fileId);
    if (!file) {
        return res.status(404).json({
            success: false,
            error: 'File not found'
        });
    }

    try {
        console.log('Downloading file:', {
            projectId,
            fileId,
            filePath: file.path,
            fileName: file.name
        });

        // Get file data using the path from file metadata
        const fileData = await fileStorageService.getFile(projectId, file.path);

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);

        // Send file
        res.send(fileData);
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}); 