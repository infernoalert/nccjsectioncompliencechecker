const Project = require('../../models/Project');
const { model: EnergyMonitoring } = require('../../models/EnergyMonitoring');

class ProjectUpdater {
    constructor(projectId) {
        this.projectId = projectId;
    }

    _cleanJsonResponse(rawResponse) {
        try {
            // Remove markdown code block if present
            let cleanedResponse = rawResponse;
            if (rawResponse.includes('```json')) {
                cleanedResponse = rawResponse.split('```json')[1].split('```')[0].trim();
            } else if (rawResponse.includes('```')) {
                cleanedResponse = rawResponse.split('```')[1].split('```')[0].trim();
            }
            
            console.log('Cleaned JSON response:', cleanedResponse);
            return JSON.parse(cleanedResponse);
        } catch (error) {
            console.error('Error cleaning JSON response:', error);
            console.error('Raw response:', rawResponse);
            throw new Error(`Failed to parse JSON response: ${error.message}`);
        }
    }

    async validateUpdate(analysis) {
        try {
            console.log('ProjectUpdater received analysis:', JSON.stringify(analysis, null, 2));
            
            // Basic validation of analysis results
            if (!analysis || typeof analysis !== 'object') {
                console.log('Invalid analysis: Not an object or null');
                return false;
            }

            // Clean and parse the raw analysis if it's a string
            let parsedAnalysis = analysis;
            if (typeof analysis.rawAnalysis === 'string') {
                try {
                    parsedAnalysis = this._cleanJsonResponse(analysis.rawAnalysis);
                    console.log('Successfully parsed raw analysis:', JSON.stringify(parsedAnalysis, null, 2));
                } catch (error) {
                    console.error('Failed to parse raw analysis:', error);
                    return false;
                }
            }

            // Check if energyMonitoringDevices exists and is an array
            if (!parsedAnalysis.energyMonitoringDevices || !Array.isArray(parsedAnalysis.energyMonitoringDevices)) {
                console.log('Invalid analysis: energyMonitoringDevices is not an array');
                return false;
            }

            // Validate each device in the array
            for (const device of parsedAnalysis.energyMonitoringDevices) {
                if (!device.label || !device.panel || !device.type) {
                    console.log('Invalid device: missing required fields', device);
                    return false;
                }
            }

            // Update the analysis object with parsed data
            analysis.energyMonitoringDevices = parsedAnalysis.energyMonitoringDevices;
            return true;
        } catch (error) {
            console.error('Validation error:', error);
            return false;
        }
    }

    _normalizeDeviceType(type) {
        // Convert to lowercase and remove special characters
        const normalized = type.toLowerCase().replace(/[_-]/g, ' ').trim();
        
        // Map variations to accepted types
        const typeMap = {
            'smart meter': 'smart-meter',
            'smartmeter': 'smart-meter',
            'monitoring': 'smart-meter',
            'monitoring panel': 'smart-meter',
            'monitoringpanel': 'smart-meter',
            'monitoring device': 'smart-meter',
            'energy monitoring panel': 'smart-meter',
            'meter': 'meter',
            'energy meter': 'meter',
            'power meter': 'meter',
            'current transformer': 'meter-memory',
            'ct': 'meter-memory',
            'voltage transformer': 'meter-memory',
            'vt': 'meter-memory',
            'meter memory': 'meter-memory',
            'auth meter': 'auth-meter',
            'auth-meter': 'auth-meter'
        };

        return typeMap[normalized] || 'smart-meter'; // Default to smart-meter if no match
    }

    async updateProject(analysis) {
        try {
            // Find the project
            const project = await Project.findById(this.projectId);
            if (!project) {
                throw new Error('Project not found');
            }

            // Update MCP analysis results
            project.mcp.analysisResults = {
                lastAnalyzed: new Date(),
                energyMonitoringDevices: analysis.energyMonitoringDevices,
                rawAnalysis: analysis.rawAnalysis
            };

            // Clear existing energy monitoring array
            project.electrical.energyMonitoring = [];

            // Handle energy monitoring devices
            for (const device of analysis.energyMonitoringDevices) {
                // Create new energy monitoring record with normalized type
                const energyMonitoringData = {
                    label: device.label,
                    panel: device.panel,
                    type: this._normalizeDeviceType(device.type),
                    description: device.description || '',
                    connection: device.connection || '',
                    status: 'active',
                    lastUpdated: new Date()
                };

                console.log('Processing device:', JSON.stringify(energyMonitoringData, null, 2));

                // Update or create monitoring record
                const savedMonitoring = await EnergyMonitoring.findOneAndUpdate(
                    { label: device.label, panel: device.panel },
                    energyMonitoringData,
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );
                console.log('Saved monitoring record:', JSON.stringify(savedMonitoring, null, 2));

                // Add the full monitoring object to project's electrical energy monitoring array
                project.electrical.energyMonitoring.push(savedMonitoring);
            }

            // Save the updated project
            await project.save();
            console.log('Project updated successfully');

            return project;
        } catch (error) {
            console.error('Error updating project:', error);
            throw error;
        }
    }

    async getProjectStatus() {
        try {
            const project = await Project.findById(this.projectId)
                .populate('electrical.energyMonitoring');
            
            if (!project) {
                throw new Error('Project not found');
            }

            return {
                success: true,
                status: project.complianceStatus,
                lastUpdated: project.lastAssessmentDate,
                analysisResults: project.mcp.analysisResults,
                energyMonitoring: project.electrical.energyMonitoring
            };
        } catch (error) {
            console.error('Failed to get project status:', error);
            return {
                success: false,
                error: `Failed to get project status: ${error.message}`
            };
        }
    }
}

module.exports = ProjectUpdater; 