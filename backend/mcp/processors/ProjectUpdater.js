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

            // Update project with analysis results
            project.analysisResults = {
                ...project.analysisResults,
                hasAirConditioning: analysis.hasAirConditioning,
                acType: analysis.acType,
                acLocation: analysis.acLocation,
                requirements: analysis.requirements,
                otherSystems: analysis.otherSystems,
                lastAnalyzed: new Date(),
                rawAnalysis: analysis.rawAnalysis
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
                await EnergyMonitoring.findOneAndUpdate(
                    { partNumber: energyMonitoringData.partNumber },
                    energyMonitoringData,
                    { upsert: true, new: true }
                );

                // Link energy monitoring to project
                project.energyMonitoring = energyMonitoringData._id;
            }

            // Add any additional analysis if present
            if (analysis.additionalAnalysis) {
                project.analysisResults.additionalAnalysis = analysis.additionalAnalysis;
            }

            // Update project status
            project.status = 'ANALYZED';
            project.lastUpdated = new Date();

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
                .populate('energyMonitoring');
            
            if (!project) {
                throw new Error('Project not found');
            }

            return {
                success: true,
                status: project.status,
                lastUpdated: project.lastUpdated,
                analysisResults: project.analysisResults,
                energyMonitoring: project.energyMonitoring
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