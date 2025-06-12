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
            'meter': 'general-meter',
            'energy-meter': 'general-meter',
            'energymeter': 'general-meter',
            'power-meter': 'general-meter',
            'powermeter': 'general-meter',           
            'meter memory': 'memory-meter',
            'auth meter': 'auth-meter',
            'auth-meter': 'auth-meter',
            'authority meter': 'auth-meter',
            'energy monitoring device': 'smart-meter'
        };

        return typeMap[normalized] || 'smart meter'; // Default to smart meter if no match
    }

    async updateProject(analysis) {
        try {
            console.log('Starting project update for project:', this.projectId);
            
            // Find the project
            const project = await Project.findById(this.projectId);
            if (!project) {
                throw new Error('Project not found');
            }
            console.log('Found project:', { 
                id: project._id, 
                name: project.name,
                floorArea: project.floorArea 
            });

            // Update MCP analysis results first
            project.mcp.analysisResults = {
                lastAnalyzed: new Date(),
                energyMonitoringDevices: analysis.energyMonitoringDevices,
                rawAnalysis: analysis.rawAnalysis
            };
            project.markModified('mcp.analysisResults');
            await project.save();
            console.log('MCP analysis results saved');

            // Check if we already have devices (to prevent double processing)
            const existingDeviceCount = project.electrical.energyMonitoring.length;
            console.log('Existing energy monitoring devices:', existingDeviceCount);
            
            // Clear existing energy monitoring array (but don't save yet)
            console.log('Clearing existing energy monitoring array');
            project.electrical.energyMonitoring = [];
            project.markModified('electrical.energyMonitoring');
            console.log('Energy monitoring array cleared (not saved yet)');

            // Handle energy monitoring devices one by one (like manual add)
            console.log('Processing energy monitoring devices:', analysis.energyMonitoringDevices.length);
            for (const device of analysis.energyMonitoringDevices.filter(d => d.label && d.panel)) {
                // Create new energy monitoring record with normalized type
                const energyMonitoringData = {
                    label: device.label,
                    panel: device.panel,
                    monitoringDeviceType: this._normalizeDeviceType(device.type),
                    description: device.description || '',
                    connection: device.connection || '',
                    status: 'active',
                    lastUpdated: new Date()
                };

                console.log('Creating/updating device:', {
                    label: energyMonitoringData.label,
                    panel: energyMonitoringData.panel,
                    type: energyMonitoringData.monitoringDeviceType
                });

                // Update or create monitoring record
                const savedMonitoring = await EnergyMonitoring.findOneAndUpdate(
                    { label: device.label, panel: device.panel },
                    energyMonitoringData,
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );
                console.log('Saved monitoring record:', {
                    id: savedMonitoring._id,
                    label: savedMonitoring.label,
                    type: savedMonitoring.monitoringDeviceType
                });

                // Add to project (but don't save yet)
                project.electrical.energyMonitoring.push(savedMonitoring._id);
                project.markModified('electrical.energyMonitoring');
                
                console.log('Added device to project, current count:', project.electrical.energyMonitoring.length);
            }

            // Save the project with all devices at once
            console.log('About to save project with', project.electrical.energyMonitoring.length, 'devices');
            await project.save();
            console.log('Project saved with all devices');

            // Immediately verify the save worked
            const immediateCheck = await Project.findById(this.projectId);
            console.log('IMMEDIATE POST-SAVE CHECK - energyMonitoring count:', immediateCheck.electrical.energyMonitoring.length);

            console.log('All devices processed successfully:', {
                deviceCount: project.electrical.energyMonitoring.length,
                deviceIds: project.electrical.energyMonitoring
            });

            // Wait a moment to ensure database write is fully committed
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Check again after delay
            const delayedCheck = await Project.findById(this.projectId);
            console.log('DELAYED CHECK (500ms later) - energyMonitoring count:', delayedCheck.electrical.energyMonitoring.length);

            return project;
        } catch (error) {
            console.error('Error updating project:', error);
            throw error;
        }
    }

    async verifyProjectUpdate(projectId) {
        try {
            console.log('Verifying project update for:', projectId);
            
            // Wait a moment for database to fully sync
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Force a fresh read from database (bypass any caching)
            const project = await Project.findById(projectId)
                .populate('electrical.energyMonitoring')
                .lean(false)  // Ensure we get a full mongoose document
                .exec();      // Force execution
            
            if (!project) {
                throw new Error('Project not found during verification');
            }
            
            console.log('Verification - Energy monitoring devices found:', {
                count: project.electrical.energyMonitoring.length,
                devices: project.electrical.energyMonitoring.map(d => ({
                    id: d._id,
                    label: d.label,
                    panel: d.panel
                }))
            });
            
            // Check the raw project document without populate
            const rawProject = await Project.findById(projectId);
            console.log('VERIFICATION - Raw project energyMonitoring ObjectIds:', rawProject.electrical.energyMonitoring);
            console.log('VERIFICATION - Raw project energyMonitoring count:', rawProject.electrical.energyMonitoring.length);
            
            return {
                success: true,
                deviceCount: project.electrical.energyMonitoring.length,
                devices: project.electrical.energyMonitoring
            };
        } catch (error) {
            console.error('Verification failed:', error);
            return {
                success: false,
                error: error.message
            };
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