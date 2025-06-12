class MCPContext {
    constructor(projectId) {
        this.projectId = projectId;
        this.currentStep = 'FILE_UPLOAD';
        this.lastUpdated = new Date();
        this.history = [];
        this.analysisResults = {
            hasAirConditioning: null,
            lastAnalyzed: null,
            rawAnalysis: null,
            extractedData: null
        };
        this.processingStatus = 'IDLE';
    }

    updateStep(step) {
        this.currentStep = step;
        this.lastUpdated = new Date();
    }

    addHistoryEntry(entry) {
        this.history.push({
            step: entry.step,
            timestamp: new Date(),
            status: entry.status || 'PENDING',
            error: entry.error || null,
            metadata: entry.metadata || null
        });
    }

    updateAnalysisResults(results) {
        this.analysisResults = {
            ...this.analysisResults,
            ...results,
            lastAnalyzed: new Date()
        };
    }

    updateProcessingStatus(status) {
        this.processingStatus = status;
        this.lastUpdated = new Date();
    }

    getCurrentState() {
        return {
            projectId: this.projectId,
            currentStep: this.currentStep,
            lastUpdated: this.lastUpdated,
            history: this.history,
            analysisResults: this.analysisResults,
            processingStatus: this.processingStatus
        };
    }
}

module.exports = MCPContext; 