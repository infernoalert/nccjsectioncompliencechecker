const MCPContext = require('./MCPContext');
const FileProcessor = require('./processors/FileProcessor');
const LLMAnalyzer = require('./processors/LLMAnalyzer');
const ProjectUpdater = require('./processors/ProjectUpdater');
const path = require('path');
const fs = require('fs').promises;

/**
 * MCP (Model Context Protocol) Handler
 * 
 * Updated process flow (simplified):
 * 1. FILE_INITIALIZATION - Initialize and validate file processor
 * 2. TEXT_EXTRACTION - Extract text content from the uploaded file
 * 3. INITIAL_ANALYSIS - Analyze text using LLM to identify energy monitoring devices
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
            const text = await this._handleTextExtraction();
            
            // Step 3: Initial Analysis
            const analysis = await this._handleInitialAnalysis(text);
            
            // Step 4: Project Update
            await this._handleProjectUpdate(analysis);
            
            // Step 5: Next Analysis (if needed)
            await this._handleNextAnalysis();
            
            // Process completed - project data has been updated
            console.log('MCP Process completed successfully - project data updated');
            
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
        
        this.context.addHistoryEntry({
            step: 'FILE_INITIALIZATION',
            status: 'COMPLETED'
        });
    }

    async _handleTextExtraction() {
        this.context.updateStep('TEXT_EXTRACTION');
        const result = await this.fileProcessor.extractText();
        
        if (!result.success) {
            throw new Error(result.error);
        }
        
        this.context.addHistoryEntry({
            step: 'TEXT_EXTRACTION',
            status: 'COMPLETED'
        });
        
        return result.text;
    }

    async _handleInitialAnalysis(text) {
        this.context.updateStep('INITIAL_ANALYSIS');
        const analysis = await this.llmAnalyzer.analyzeText(text);
        
        if (!analysis.success) {
            throw new Error(analysis.error);
        }
        
        this.context.addHistoryEntry({
            step: 'INITIAL_ANALYSIS',
            status: 'COMPLETED'
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