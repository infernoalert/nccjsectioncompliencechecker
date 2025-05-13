const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class FileStorageService {
    constructor() {
        // Use absolute path for Windows compatibility, relative to backend directory
        this.baseUploadPath = path.resolve(__dirname, '..', 'uploads', 'projects');
        this.tempPath = path.resolve(__dirname, '..', 'uploads', 'temp');
        this.allowedFileTypes = ['pdf'];
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
    }

    /**
     * Initialize storage directories
     */
    async initialize() {
        try {
            console.log('Initializing storage directories:', {
                baseUploadPath: this.baseUploadPath,
                tempPath: this.tempPath
            });
            
            // Create directories with full permissions
            await fs.mkdir(this.baseUploadPath, { recursive: true, mode: 0o777 });
            await fs.mkdir(this.tempPath, { recursive: true, mode: 0o777 });
            
            // Verify directories exist and are writable
            await fs.access(this.baseUploadPath, fs.constants.W_OK);
            await fs.access(this.tempPath, fs.constants.W_OK);
            
            console.log('Storage directories initialized successfully');
        } catch (error) {
            console.error('Error initializing storage directories:', error);
            throw new Error(`Failed to initialize file storage system: ${error.message}`);
        }
    }

    /**
     * Generate a unique filename
     * @param {string} originalFilename - Original filename
     * @returns {string} - Unique filename
     */
    generateUniqueFilename(originalFilename) {
        const timestamp = Date.now();
        const randomString = crypto.randomBytes(8).toString('hex');
        const extension = path.extname(originalFilename).toLowerCase();
        return `${timestamp}-${randomString}${extension}`;
    }

    /**
     * Validate file
     * @param {Object} file - File object
     * @returns {Object} - Validation result
     */
    validateFile(file) {
        const errors = [];

        // Check file type
        const fileType = path.extname(file.originalname).toLowerCase().slice(1);
        if (!this.allowedFileTypes.includes(fileType)) {
            errors.push(`File type ${fileType} is not allowed. Allowed types: ${this.allowedFileTypes.join(', ')}`);
        }

        // Check file size
        if (file.size > this.maxFileSize) {
            errors.push(`File size exceeds maximum limit of ${this.maxFileSize / (1024 * 1024)}MB`);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Save file to project directory
     * @param {string} projectId - Project ID
     * @param {Object} file - File object
     * @returns {Object} - File metadata
     */
    async saveFile(projectId, file) {
        try {
            console.log('Starting file upload process:', {
                projectId,
                originalName: file.originalname,
                size: file.size,
                buffer: file.buffer ? 'Buffer exists' : 'No buffer'
            });

            // Validate file
            const validation = this.validateFile(file);
            if (!validation.isValid) {
                throw new Error(validation.errors.join(', '));
            }

            // Create project directory if it doesn't exist
            const projectPath = path.join(this.baseUploadPath, projectId, 'documents');
            console.log('Creating project directory:', projectPath);
            await fs.mkdir(projectPath, { recursive: true, mode: 0o777 });

            // Generate unique filename
            const uniqueFilename = this.generateUniqueFilename(file.originalname);
            const filePath = path.join(projectPath, uniqueFilename);
            console.log('Generated file path:', filePath);

            // Write file to disk
            console.log('Writing file to disk...');
            await fs.writeFile(filePath, file.buffer);
            console.log('File written successfully');

            // Verify file exists
            try {
                await fs.access(filePath, fs.constants.F_OK);
                const stats = await fs.stat(filePath);
                console.log('File verification successful:', {
                    path: filePath,
                    size: stats.size,
                    created: stats.birthtime
                });
            } catch (error) {
                console.error('File verification failed:', error);
                throw new Error('File was not written successfully');
            }

            // Return file metadata with normalized path
            return {
                name: file.originalname,
                path: filePath.replace(/\\/g, '/'), // Normalize path for Windows
                type: path.extname(file.originalname).toLowerCase().slice(1),
                size: file.size,
                uploadedAt: new Date()
            };
        } catch (error) {
            console.error('Error saving file:', error);
            throw new Error(`Failed to save file: ${error.message}`);
        }
    }

    /**
     * Delete file
     * @param {string} projectId - Project ID
     * @param {string} filename - Filename
     */
    async deleteFile(projectId, filename) {
        try {
            const filePath = path.join(this.baseUploadPath, projectId, 'documents', filename);
            await fs.unlink(filePath);
        } catch (error) {
            console.error('Error deleting file:', error);
            throw new Error('Failed to delete file');
        }
    }

    /**
     * Get file
     * @param {string} projectId - Project ID
     * @param {string} filename - Filename
     * @returns {Buffer} - File data
     */
    async getFile(projectId, filename) {
        try {
            console.log('Attempting to read file:', {
                projectId,
                filename,
                fullPath: path.join(this.baseUploadPath, projectId, 'documents', filename)
            });

            // Extract the unique filename from the path if it's a full path
            const uniqueFilename = path.basename(filename);
            const filePath = path.join(this.baseUploadPath, projectId, 'documents', uniqueFilename);
            
            console.log('Reading file from path:', filePath);
            const fileData = await fs.readFile(filePath);
            console.log('File read successfully, size:', fileData.length);
            
            return fileData;
        } catch (error) {
            console.error('Error reading file:', error);
            throw new Error(`Failed to read file: ${error.message}`);
        }
    }

    /**
     * List project files
     * @param {string} projectId - Project ID
     * @returns {Array} - List of files
     */
    async listFiles(projectId) {
        try {
            const projectPath = path.join(this.baseUploadPath, projectId, 'documents');
            const files = await fs.readdir(projectPath);
            
            const fileDetails = await Promise.all(
                files.map(async (filename) => {
                    const filePath = path.join(projectPath, filename);
                    const stats = await fs.stat(filePath);
                    return {
                        name: filename,
                        path: filePath,
                        size: stats.size,
                        uploadedAt: stats.mtime
                    };
                })
            );

            return fileDetails;
        } catch (error) {
            console.error('Error listing files:', error);
            throw new Error('Failed to list files');
        }
    }
}

module.exports = new FileStorageService(); 