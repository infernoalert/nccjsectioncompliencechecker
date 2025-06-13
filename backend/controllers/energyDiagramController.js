const EnergyDiagramGenerator = require('../services/energyDiagramGenerator');
const { model: EnergyMonitoring } = require('../models/EnergyMonitoring');
const Project = require('../models/Project');

class EnergyDiagramController {
    constructor() {
        this.diagramGenerator = new EnergyDiagramGenerator();
    }

    /**
     * Generate diagram commands from project's energy monitoring data
     * POST /api/projects/:projectId/energy-diagram/generate
     */
    async generateFromProject(req, res) {
        try {
            const { projectId } = req.params;
            const { saveToFile = false } = req.body;

            // Find project and populate energy monitoring data
            const project = await Project.findById(projectId).populate('electrical.energyMonitoring');
            if (!project) {
                return res.status(404).json({
                    success: false,
                    error: 'Project not found'
                });
            }

            // Get energy monitoring data from project
            let energyMonitoringData = [];
            
            // Check if project has energy monitoring data in electrical.energyMonitoring
            if (project.electrical && project.electrical.energyMonitoring && project.electrical.energyMonitoring.length > 0) {
                energyMonitoringData = project.electrical.energyMonitoring;
            } else {
                // Fallback to separate collection (if exists)
                energyMonitoringData = await EnergyMonitoring.find({ projectId });
            }

            if (energyMonitoringData.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'No energy monitoring devices found for this project',
                    message: 'Please add energy monitoring devices to the project before generating a diagram'
                });
            }

            // Generate diagram commands
            const result = await this.diagramGenerator.generateDiagramCommands(
                energyMonitoringData,
                {
                    projectId: project._id,
                    projectName: project.name || 'Unnamed Project'
                }
            );

            // Save to file if requested
            let fileInfo = null;
            if (saveToFile) {
                fileInfo = await this.diagramGenerator.saveCommandsToFile(
                    result.commands,
                    result.metadata,
                    projectId
                );
            }

            res.json({
                success: true,
                commands: result.commands,
                metadata: result.metadata,
                nodePositions: result.nodePositions,
                nodeIds: result.nodeIds,
                fileInfo,
                executionInstructions: {
                    description: 'Execute these commands in sequence on the frontend diagram engine',
                    commandFormat: 'Each command follows the diagram programming language specification',
                    totalCommands: result.commands.length
                }
            });

        } catch (error) {
            console.error('Error generating energy diagram:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to generate energy diagram',
                details: error.message
            });
        }
    }


}

// Create instance and export methods
const energyDiagramController = new EnergyDiagramController();

module.exports = {
    generateFromProject: energyDiagramController.generateFromProject.bind(energyDiagramController)
}; 