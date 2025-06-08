const Project = require('../../models/Project');
const { model: EnergyMonitoring } = require('../../models/EnergyMonitoring');

class ProjectUpdater {
    constructor(projectId) {
        this.projectId = projectId;
    }

    async validateUpdate(analysis) {
        try {
            // Basic validation of analysis results
            if (!analysis || typeof analysis !== 'object') {
                return false;
            }

            // Check required fields
            if (typeof analysis.hasAirConditioning !== 'boolean') {
                return false;
            }

            // Validate energy monitoring data if present
            if (analysis.energyMonitoring) {
                const requiredFields = ['systemType', 'name', 'partNumber'];
                for (const field of requiredFields) {
                    if (!analysis.energyMonitoring[field]) {
                        return false;
                    }
                }
            }

            return true;
        } catch (error) {
            console.error('Validation error:', error);
            return false;
        }
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
                hasAirConditioning: analysis.hasAirConditioning,
                lastAnalyzed: new Date(),
                rawAnalysis: {
                    acType: analysis.acType,
                    acLocation: analysis.acLocation,
                    requirements: analysis.requirements,
                    otherSystems: analysis.otherSystems
                }
            };

            // Handle energy monitoring data
            if (analysis.energyMonitoring) {
                const energyMonitoringData = new EnergyMonitoring({
                    systemType: analysis.energyMonitoring.systemType,
                    name: analysis.energyMonitoring.name,
                    partNumber: analysis.energyMonitoring.partNumber,
                    description: analysis.energyMonitoring.description,
                    manufacturer: analysis.energyMonitoring.manufacturer,
                    specifications: analysis.energyMonitoring.specifications,
                    status: 'active'
                });

                // Update or create energy monitoring record
                const savedMonitoring = await EnergyMonitoring.findOneAndUpdate(
                    { partNumber: energyMonitoringData.partNumber },
                    energyMonitoringData,
                    { upsert: true, new: true }
                );

                // Add to project's electrical energy monitoring array
                project.electrical.energyMonitoring.push(savedMonitoring._id);
            }

            // Update MCP status
            project.mcp.currentStep = 'analysis_complete';
            project.mcp.lastUpdated = new Date();
            project.mcp.processingStatus = 'completed';

            // Update project status
            project.complianceStatus = 'pending';
            project.lastAssessmentDate = new Date();

            // Save changes
            await project.save();

            return {
                success: true,
                project: project
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to update project: ${error.message}`
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
            return {
                success: false,
                error: `Failed to get project status: ${error.message}`
            };
        }
    }
}

module.exports = ProjectUpdater; 