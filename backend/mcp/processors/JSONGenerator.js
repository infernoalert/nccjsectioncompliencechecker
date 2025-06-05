const fs = require('fs').promises;
const path = require('path');

class JSONGenerator {
    constructor() {
        this.outputDir = path.join(process.cwd(), 'output', 'json');
    }

    async generate(analysisResults) {
        try {
            // Ensure output directory exists
            await fs.mkdir(this.outputDir, { recursive: true });

            // Generate unique filename
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `analysis-${timestamp}.json`;
            const filePath = path.join(this.outputDir, filename);

            // Convert analysis results to JSON
            const jsonData = {
                timestamp: new Date().toISOString(),
                analysis: analysisResults,
                metadata: {
                    version: '1.0',
                    generator: 'NCCJ Section Compliance Checker'
                }
            };

            // Write JSON file
            await fs.writeFile(
                filePath,
                JSON.stringify(jsonData, null, 2),
                'utf8'
            );

            return {
                success: true,
                filePath: filePath
            };
        } catch (error) {
            return {
                success: false,
                error: `JSON generation failed: ${error.message}`
            };
        }
    }
}

module.exports = JSONGenerator; 