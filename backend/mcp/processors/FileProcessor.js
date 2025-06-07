const fs = require('fs').promises;
const path = require('path');
const pdf = require('pdf-parse');
const pdfPoppler = require('pdf-poppler');
const sharp = require('sharp');
const { createWorker } = require('tesseract.js');
const os = require('os');

class FileProcessor {
    constructor(filePath, isExistingFile = false) {
        this.filePath = filePath;
        this.isExistingFile = isExistingFile;
        this.fileContent = null;
        this.tempDir = path.join(os.tmpdir(), 'pdf-processing');
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

    async convertPdfToImages() {
        try {
            // Create temp directory if it doesn't exist
            await fs.mkdir(this.tempDir, { recursive: true });

            const opts = {
                format: 'png',
                out_dir: this.tempDir,
                out_prefix: 'page',
                page: null // Convert all pages
            };

            await pdfPoppler.convert(this.filePath, opts);
            
            // Get list of generated image files
            const files = await fs.readdir(this.tempDir);
            return files.filter(file => file.startsWith('page') && file.endsWith('.png'))
                       .map(file => path.join(this.tempDir, file));
        } catch (error) {
            throw new Error(`PDF to image conversion failed: ${error.message}`);
        }
    }

    async preprocessImage(imagePath) {
        try {
            const processedImagePath = imagePath.replace('.png', '_processed.png');
            
            await sharp(imagePath)
                .grayscale() // Convert to grayscale
                .normalize() // Normalize contrast
                .sharpen() // Enhance edges
                .toFile(processedImagePath);

            return processedImagePath;
        } catch (error) {
            throw new Error(`Image preprocessing failed: ${error.message}`);
        }
    }

    async performOCR(imagePath) {
        try {
            const worker = await createWorker();
            await worker.loadLanguage('eng');
            await worker.initialize('eng');
            
            const { data: { text } } = await worker.recognize(imagePath);
            await worker.terminate();
            
            return text;
        } catch (error) {
            throw new Error(`OCR failed: ${error.message}`);
        }
    }

    async extractText() {
        try {
            let combinedText = '';
            
            // 1. Extract text using pdf-parse
            const dataBuffer = await fs.readFile(this.filePath);
            const pdfData = await pdf(dataBuffer);
            const pdfText = pdfData.text;
            
            // 2. Convert PDF to images and perform OCR
            const imageFiles = await this.convertPdfToImages();
            let ocrText = '';
            
            for (const imageFile of imageFiles) {
                // Preprocess image
                const processedImagePath = await this.preprocessImage(imageFile);
                
                // Perform OCR
                const pageText = await this.performOCR(processedImagePath);
                ocrText += pageText + '\n';
                
                // Cleanup processed image
                await fs.unlink(processedImagePath);
                await fs.unlink(imageFile);
            }
            
            // Combine both results
            combinedText = `PDF Parsed Text:\n${pdfText}\n\nOCR Text:\n${ocrText}`;
            
            // Store combined content
            this.fileContent = combinedText;
            
            // Cleanup temp directory
            await fs.rm(this.tempDir, { recursive: true, force: true });
            
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