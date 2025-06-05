class AnalysisResults {
    constructor() {
        this.hasAirConditioning = null;
        this.lastAnalyzed = null;
        this.rawAnalysis = null;
    }

    updateResults(results) {
        if (results.hasAirConditioning !== undefined) {
            this.hasAirConditioning = results.hasAirConditioning;
        }
        if (results.rawAnalysis) {
            this.rawAnalysis = results.rawAnalysis;
        }
        this.lastAnalyzed = new Date();
    }

    getStructuredData() {
        return {
            hasAirConditioning: this.hasAirConditioning,
            lastAnalyzed: this.lastAnalyzed,
            rawAnalysis: this.rawAnalysis
        };
    }

    toJSON() {
        return this.getStructuredData();
    }
}

module.exports = AnalysisResults; 