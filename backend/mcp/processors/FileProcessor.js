const fs = require('fs').promises;
const path = require('path');
const pdf = require('pdf-parse');

class FileProcessor {
    constructor(filePath, isExistingFile = false) {
        this.filePath = filePath;
        this.isExistingFile = isExistingFile;
        this.fileContent = null;
    }

    async validateFile() {
        try {
            // Check if file exists
            await fs.access(this.filePath);
            
            // Check file extension
            const ext = path.extname(this.filePath).toLowerCase();
            if (ext !== '.pdf') {
                return {
                    success: false,
                    error: 'File must be a PDF'
                };
            }

            // Check file size (max 10MB)
            const stats = await fs.stat(this.filePath);
            if (stats.size > 10 * 1024 * 1024) {
                return {
                    success: false,
                    error: 'File size exceeds 10MB limit'
                };
            }

            return {
                success: true
            };
        } catch (error) {
            return {
                success: false,
                error: `File validation failed: ${error.message}`
            };
        }
    }

    async extractText() {
        try {
            // Read file content
            const dataBuffer = await fs.readFile(this.filePath);
            
            // Parse PDF
            const data = await pdf(dataBuffer);
            
            // Store file content
            this.fileContent = data.text;
            
            return {
                success: true,
                text: this.fileContent
            };
        } catch (error) {
            return {
                success: false,
                error: `Text extraction failed: ${error.message}`
            };
        }
    }

    async getFileMetadata() {
        try {
            const stats = await fs.stat(this.filePath);
            return {
                success: true,
                metadata: {
                    name: path.basename(this.filePath),
                    size: stats.size,
                    created: stats.birthtime,
                    modified: stats.mtime
                }
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to get file metadata: ${error.message}`
            };
        }
    }

    getFileContent() {
        return this.fileContent;
    }
}

module.exports = FileProcessor; 