const MCPContext = require('./MCPContext');
const FileProcessor = require('./processors/FileProcessor');
const LLMAnalyzer = require('./processors/LLMAnalyzer');
const ProjectUpdater = require('./processors/ProjectUpdater');
const updateDeviceTypesByProjectSize = require('../utils/deviceTypeUpdater');
const path = require('path');
const fs = require('fs').promises;

/**
 * MCP (Model Context Protocol) Handler
 * 
 * Updated process flow with conditional processing:
 * 1. FILE_INITIALIZATION - Initialize and validate file processor, determine document type
 * 2. TEXT_EXTRACTION - Extract text content using conditional OCR:
 *    - ≤3 pages: Use both text parsing and OCR (regular document)
 *    - >3 pages: Use text parsing only (electrical specification)
 * 3. INITIAL_ANALYSIS - Analyze text using specialized LLM prompts based on document type
 * 4. PROJECT_UPDATE - Update project data with analyzed devices
 * 5. NEXT_ANALYSIS - Perform additional analysis if needed
 * 
 * Process completes after project data update - no JSON/diagram generation required
 */
class MCPHandler {
    constructor(projectId, openaiApiKey) {
        this.context = new MCPContext(projectId);
        this.fileProcessor = null;
        this.llmAnalyzer = new LLMAnalyzer(openaiApiKey);
        this.projectUpdater = new ProjectUpdater(projectId);
        this.processLockFile = path.join(__dirname, '..', 'temp', `mcp-lock-${projectId}.lock`);
    }

    async _createProcessLock() {
        try {
            const tempDir = path.dirname(this.processLockFile);
            await fs.mkdir(tempDir, { recursive: true });
            await fs.writeFile(this.processLockFile, JSON.stringify({
                projectId: this.context.projectId,
                timestamp: new Date().toISOString(),
                pid: process.pid
            }));
            console.log('MCP process lock created:', this.processLockFile);
        } catch (error) {
            console.warn('Failed to create process lock:', error.message);
        }
    }

    async _removeProcessLock() {
        try {
            await fs.unlink(this.processLockFile);
            console.log('MCP process lock removed:', this.processLockFile);
        } catch (error) {
            console.warn('Failed to remove process lock:', error.message);
        }
    }

    async processExistingFile(filePath) {
        try {
            // Create process lock to prevent nodemon interference
            await this._createProcessLock();
            
            this.context.updateProcessingStatus('PROCESSING');
            
            // Step 1: Initialize File Processor with existing file
            await this._initializeFileProcessor(filePath);
            
            // Step 2: Text Extraction
            const extractionResult = await this._handleTextExtraction();
            
            // Step 3: Initial Analysis
            const analysis = await this._handleInitialAnalysis(extractionResult);
            
            // Step 4: Project Update
            await this._handleProjectUpdate(analysis);
            
            // Step 5: Next Analysis (if needed)
            await this._handleNextAnalysis();
            
            // Process completed - project data has been updated
            console.log('MCP Process completed successfully - project data updated');
            
            // Step 6: Post-MCP Device Type Update (runs separately after MCP completion)
            await this._handlePostMCPDeviceTypeUpdate();
            
            this.context.updateProcessingStatus('COMPLETED');
            return this.context.getCurrentState();
        } catch (error) {
            console.error('MCP Process failed:', error);
            this.context.updateProcessingStatus('FAILED');
            this.context.addHistoryEntry({
                step: this.context.currentStep,
                status: 'FAILED',
                error: error.message
            });
            throw error;
        } finally {
            // Always remove process lock
            await this._removeProcessLock();
        }
    }

    async _initializeFileProcessor(filePath) {
        this.context.updateStep('FILE_INITIALIZATION');
        
        // Validate file path
        if (!filePath || !path.isAbsolute(filePath)) {
            throw new Error('Invalid file path provided');
        }

        // Initialize file processor with existing file
        this.fileProcessor = new FileProcessor(filePath, true);
        const result = await this.fileProcessor.validateFile();
        
        if (!result.success) {
            throw new Error(result.error);
        }

        // Get page count and determine document type
        const pageCountResult = await this.fileProcessor.detectPageCount();
        if (!pageCountResult.success) {
            throw new Error(pageCountResult.error);
        }

        console.log(`Document initialized: ${pageCountResult.pageCount} pages, type: ${pageCountResult.documentType}`);
        
        this.context.addHistoryEntry({
            step: 'FILE_INITIALIZATION',
            status: 'COMPLETED',
            metadata: {
                pageCount: pageCountResult.pageCount,
                documentType: pageCountResult.documentType
            }
        });
    }

    async _handleTextExtraction() {
        this.context.updateStep('TEXT_EXTRACTION');
        const result = await this.fileProcessor.extractText();
        
        if (!result.success) {
            throw new Error(result.error);
        }

        console.log(`Text extraction completed using: ${result.processingMethod}`);
        
        this.context.addHistoryEntry({
            step: 'TEXT_EXTRACTION',
            status: 'COMPLETED',
            metadata: {
                documentType: result.documentType,
                pageCount: result.pageCount,
                processingMethod: result.processingMethod
            }
        });
        
        return result;
    }

    async _handleInitialAnalysis(extractionResult) {
        this.context.updateStep('INITIAL_ANALYSIS');
        
        // Get processing information from the file processor
        const processingInfo = this.fileProcessor.getProcessingInfo();
        
        console.log(`Starting analysis of ${processingInfo.documentType} document with ${processingInfo.processingMethod}`);
        
        const analysis = await this.llmAnalyzer.analyzeText(
            extractionResult.text, 
            processingInfo.documentType, 
            processingInfo
        );
        
        if (!analysis.success) {
            throw new Error(analysis.error);
        }
        
        this.context.addHistoryEntry({
            step: 'INITIAL_ANALYSIS',
            status: 'COMPLETED',
            metadata: {
                documentType: analysis.documentType,
                analysisType: analysis.results.analysisType,
                deviceCount: analysis.results.energyMonitoringDevices.length,
                processingInfo: analysis.processingInfo
            }
        });
        
        return analysis.results;
    }

    async _handleProjectUpdate(analysis) {
        this.context.updateStep('PROJECT_UPDATE');
        
        if (!await this.projectUpdater.validateUpdate(analysis)) {
            throw new Error('Invalid analysis results');
        }
        
        await this.projectUpdater.updateProject(analysis);
        
        // Verify the update was successful
        const verification = await this.projectUpdater.verifyProjectUpdate(this.context.projectId);
        if (!verification.success) {
            console.error('Project update verification failed:', verification.error);
            throw new Error(`Project update verification failed: ${verification.error}`);
        }
        
        console.log('Project update verified successfully:', {
            deviceCount: verification.deviceCount,
            devices: verification.devices.map(d => d.label).join(', ')
        });
        
        this.context.addHistoryEntry({
            step: 'PROJECT_UPDATE',
            status: 'COMPLETED',
            metadata: {
                deviceCount: verification.deviceCount,
                verificationStatus: 'PASSED'
            }
        });
    }

    async _handleNextAnalysis() {
        this.context.updateStep('NEXT_ANALYSIS');
        
        // Check if additional analysis is needed
        const needsAdditionalAnalysis = await this.llmAnalyzer.needsAdditionalAnalysis(
            this.context.analysisResults
        );
        
        if (needsAdditionalAnalysis) {
            const additionalAnalysis = await this.llmAnalyzer.performAdditionalAnalysis(
                this.context.analysisResults
            );
            
            if (additionalAnalysis.success) {
                this.context.updateAnalysisResults(additionalAnalysis.results);
            }
        }
        
        this.context.addHistoryEntry({
            step: 'NEXT_ANALYSIS',
            status: 'COMPLETED'
        });
    }

    async _handlePostMCPDeviceTypeUpdate() {
        try {
            console.log('\n' + '='.repeat(60));
            console.log('🔧 STARTING POST-MCP DEVICE TYPE UPDATE');
            console.log('📋 Project ID:', this.context.projectId);
            console.log('⏰ Timestamp:', new Date().toISOString());
            console.log('='.repeat(60));
            
            // Verify the function is available
            if (typeof updateDeviceTypesByProjectSize !== 'function') {
                throw new Error('updateDeviceTypesByProjectSize function not available');
            }
            
            // Run device type updater (completely separate from MCP)
            console.log('🚀 Calling updateDeviceTypesByProjectSize...');
            const result = await updateDeviceTypesByProjectSize(this.context.projectId);
            
            console.log('='.repeat(60));
            console.log('✅ POST-MCP DEVICE TYPE UPDATE COMPLETED SUCCESSFULLY');
            console.log(`📊 Updated ${result.count} devices to type: ${result.updatedType}`);
            console.log('='.repeat(60));
            
            // Add to MCP history for tracking (but not as part of MCP process)
            this.context.addHistoryEntry({
                step: 'POST_MCP_DEVICE_TYPE_UPDATE',
                status: 'COMPLETED',
                metadata: {
                    updatedDeviceCount: result.count,
                    newDeviceType: result.updatedType,
                    note: 'Ran separately after MCP completion',
                    timestamp: new Date().toISOString()
                }
            });
            
        } catch (error) {
            console.log('='.repeat(60));
            console.error('❌ POST-MCP DEVICE TYPE UPDATE FAILED');
            console.error('Error message:', error.message);
            console.error('Stack trace:', error.stack);
            console.log('='.repeat(60));
            
            // Log the error but don't fail the entire MCP process
            this.context.addHistoryEntry({
                step: 'POST_MCP_DEVICE_TYPE_UPDATE',
                status: 'FAILED',
                error: error.message,
                metadata: {
                    note: 'Device type update failed but MCP process completed successfully',
                    timestamp: new Date().toISOString(),
                    stackTrace: error.stack
                }
            });
            
            // Don't throw error - MCP process should still be considered successful
            console.log('⚠️  Note: MCP process completed successfully despite device type update failure');
        }
    }

    async handleError(error) {
        this.context.addHistoryEntry({
            step: this.context.currentStep,
            status: 'FAILED',
            error: error.message
        });
        
        // Add retry logic here if needed
        throw error;
    }

    getCurrentState() {
        return this.context.getCurrentState();
    }
}

module.exports = MCPHandler; 