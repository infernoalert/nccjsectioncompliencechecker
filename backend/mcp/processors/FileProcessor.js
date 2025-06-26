const fs = require('fs').promises;
const path = require('path');
const pdf = require('pdf-parse');
const sharp = require('sharp');
const { createWorker } = require('tesseract.js');
const os = require('os');

// Optional import for pdf-poppler (has Linux compatibility issues)
let pdfPoppler = null;
try {
    pdfPoppler = require('pdf-poppler');
    console.log('✅ pdf-poppler loaded successfully');
} catch (error) {
    console.warn('⚠️ pdf-poppler not available on this system:', error.message);
}

class FileProcessor {
    constructor(filePath, isExistingFile = false) {
        this.filePath = filePath;
        this.isExistingFile = isExistingFile;
        this.fileContent = null;
        this.pageCount = 0;
        this.documentType = null; // 'electrical_spec' or 'regular'
        this.tempDir = path.join(process.cwd(), 'temp', 'pdf-processing');
        this.worker = null;
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

    async detectPageCount() {
        try {
            const dataBuffer = await fs.readFile(this.filePath);
            const pdfData = await pdf(dataBuffer);
            this.pageCount = pdfData.numpages;
            
            // Determine document type based on page count
            this.documentType = this.pageCount > 3 ? 'electrical_spec' : 'regular';
            
            console.log(`📊 PDF Analysis - Pages: ${this.pageCount}, Document Type: ${this.documentType}`);
            
            return {
                success: true,
                pageCount: this.pageCount,
                documentType: this.documentType
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to detect page count: ${error.message}`
            };
        }
    }

    async convertPdfToImages() {
        try {
            if (!pdfPoppler) {
                throw new Error('pdf-poppler is not available on this system');
            }

            // Create temp directory if it doesn't exist
            await fs.mkdir(this.tempDir, { recursive: true });

            const opts = {
                format: 'png',
                out_dir: this.tempDir,
                out_prefix: 'page',
                page: null, // Convert all pages
                scale: 2.0  // Increase resolution for better OCR
            };

            await pdfPoppler.convert(this.filePath, opts);
            
            // Get list of generated image files
            const files = await fs.readdir(this.tempDir);
            return files.filter(file => file.startsWith('page') && file.endsWith('.png'))
                       .map(file => path.join(this.tempDir, file))
                       .sort((a, b) => {
                           // Sort files by page number
                           const numA = parseInt(a.match(/page-(\d+)/)[1]);
                           const numB = parseInt(b.match(/page-(\d+)/)[1]);
                           return numA - numB;
                       });
        } catch (error) {
            throw new Error(`PDF to image conversion failed: ${error.message}`);
        }
    }

    async preprocessImage(imagePath) {
        try {
            const processedImagePath = imagePath.replace('.png', '_processed.png');
            
            // Add a small delay to ensure file is fully written
            await new Promise(resolve => setTimeout(resolve, 100));
            
            await sharp(imagePath)
                .grayscale() // Convert to grayscale
                .normalize() // Normalize contrast
                .sharpen() // Enhance edges
                .threshold(128) // Apply threshold for better text/background separation
                .toFile(processedImagePath);

            // Add a small delay to ensure processed file is fully written
            await new Promise(resolve => setTimeout(resolve, 100));
            
            return processedImagePath;
        } catch (error) {
            throw new Error(`Image preprocessing failed: ${error.message}`);
        }
    }

    async initializeWorker() {
        if (!this.worker) {
            this.worker = await createWorker('eng');
            // Configure worker for better accuracy without OSD
            await this.worker.setParameters({
                tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,;:()[]{}<>-_=+*/\\|"\'@#$%^&!?',
                tessedit_pageseg_mode: '3', // Fully automatic page segmentation, but no OSD
                tessedit_ocr_engine_mode: '1' // Use LSTM only
            });
        }
        return this.worker;
    }

    async performOCR(imagePath) {
        try {
            const worker = await this.initializeWorker();
            // Add retry logic for OCR
            let retries = 3;
            let lastError = null;
            
            while (retries > 0) {
                try {
                    const { data: { text } } = await worker.recognize(imagePath);
                    return text;
                } catch (error) {
                    lastError = error;
                    retries--;
                    if (retries > 0) {
                        // Wait before retrying
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
            }
            
            throw lastError || new Error('OCR failed after multiple retries');
        } catch (error) {
            throw new Error(`OCR failed: ${error.message}`);
        }
    }

    async extractText() {
        let imageFiles = [];
        let processedImagePath = null;
        
        try {
            let combinedText = '';
            
            // 1. Extract text using pdf-parse
            const dataBuffer = await fs.readFile(this.filePath);
            const pdfData = await pdf(dataBuffer);
            const pdfText = pdfData.text;
            
            // Set page count if not already set
            if (this.pageCount === 0) {
                this.pageCount = pdfData.numpages;
                this.documentType = this.pageCount > 3 ? 'electrical_spec' : 'regular';
            }
            
            console.log(`Processing ${this.documentType} document with ${this.pageCount} pages`);
            
            // 2. Conditional OCR processing based on page count and pdf-poppler availability
            if (this.documentType === 'regular' && this.pageCount <= 3 && pdfPoppler) {
                // Use both text parsing and OCR for documents with 3 pages or less
                console.log('Using both text parsing and OCR (≤3 pages)');
                
                try {
                    imageFiles = await this.convertPdfToImages();
                    let ocrText = '';
                    
                    for (const imageFile of imageFiles) {
                        try {
                            // Preprocess image
                            processedImagePath = await this.preprocessImage(imageFile);
                            
                            // Perform OCR
                            const pageText = await this.performOCR(processedImagePath);
                            ocrText += `Page ${path.basename(imageFile).match(/page-(\d+)/)[1]}:\n${pageText}\n\n`;
                            
                            // Cleanup processed image
                            if (processedImagePath) {
                                await fs.unlink(processedImagePath).catch(() => {});
                                processedImagePath = null;
                            }
                            await fs.unlink(imageFile).catch(() => {});
                        } catch (pageError) {
                            console.error(`Error processing page ${imageFile}:`, pageError);
                            // Continue with next page instead of failing completely
                            continue;
                        }
                    }
                    
                    // Combine both results
                    combinedText = `PDF Parsed Text:\n${pdfText}\n\nOCR Text:\n${ocrText}`;
                } catch (ocrError) {
                    console.warn('OCR processing failed, falling back to text parsing only:', ocrError.message);
                    combinedText = `PDF Parsed Text (OCR unavailable):\n${pdfText}`;
                }
            } else {
                // Use only text parsing
                const reason = this.pageCount > 3 ? '(>3 pages - electrical spec)' : 
                              !pdfPoppler ? '(pdf-poppler unavailable)' : '';
                console.log(`Using text parsing only ${reason}`);
                combinedText = `PDF Parsed Text:\n${pdfText}`;
            }
            
            // Store combined content
            this.fileContent = combinedText;
            
            return {
                success: true,
                text: this.fileContent,
                documentType: this.documentType,
                pageCount: this.pageCount,
                processingMethod: (this.documentType === 'regular' && pdfPoppler) ? 'text_parsing_and_ocr' : 'text_parsing_only'
            };
        } catch (error) {
            return {
                success: false,
                error: `Text extraction failed: ${error.message}`
            };
        } finally {
            // Cleanup any remaining files
            try {
                if (processedImagePath) {
                    await fs.unlink(processedImagePath).catch(() => {});
                }
                for (const file of imageFiles) {
                    await fs.unlink(file).catch(() => {});
                }
                await fs.rm(this.tempDir, { recursive: true, force: true }).catch(() => {});
                
                // Terminate worker if it exists
                if (this.worker) {
                    await this.worker.terminate();
                    this.worker = null;
                }
            } catch (cleanupError) {
                console.error('Error during cleanup:', cleanupError);
            }
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

    getDocumentType() {
        return this.documentType;
    }

    getPageCount() {
        return this.pageCount;
    }

    getProcessingInfo() {
        return {
            documentType: this.documentType,
            pageCount: this.pageCount,
            processingMethod: (this.documentType === 'regular' && pdfPoppler) ? 'text_parsing_and_ocr' : 'text_parsing_only'
        };
    }
}

module.exports = FileProcessor;