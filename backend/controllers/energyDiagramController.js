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

            // Find project
            const project = await Project.findById(projectId);
            if (!project) {
                return res.status(404).json({
                    success: false,
                    error: 'Project not found'
                });
            }

            // Get energy monitoring data from project
            let energyMonitoringData = [];
            
            // Check if project has embedded energy monitoring data
            if (project.energyMonitoring && project.energyMonitoring.length > 0) {
                energyMonitoringData = project.energyMonitoring;
            } else {
                // Fallback to separate collection (if exists)
                energyMonitoringData = await EnergyMonitoring.find({ projectId });
            }

            if (energyMonitoringData.length === 0) {
                // Use sample data for demonstration
                energyMonitoringData = this.diagramGenerator.generateSampleData();
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

    /**
     * Generate diagram commands from provided energy monitoring data
     * POST /api/energy-diagram/generate
     */
    async generateFromData(req, res) {
        try {
            const { energyMonitoringData, projectData = {}, saveToFile = false } = req.body;

            if (!energyMonitoringData || !Array.isArray(energyMonitoringData)) {
                return res.status(400).json({
                    success: false,
                    error: 'energyMonitoringData must be provided as an array'
                });
            }

            // Generate diagram commands
            const result = await this.diagramGenerator.generateDiagramCommands(
                energyMonitoringData,
                projectData
            );

            // Save to file if requested
            let fileInfo = null;
            if (saveToFile) {
                const projectId = projectData.projectId || 'manual';
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
            console.error('Error generating energy diagram from data:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to generate energy diagram',
                details: error.message
            });
        }
    }

    /**
     * Get sample energy monitoring data for testing
     * GET /api/energy-diagram/sample-data
     */
    async getSampleData(req, res) {
        try {
            const sampleData = this.diagramGenerator.generateSampleData();
            
            res.json({
                success: true,
                sampleData,
                description: 'Sample energy monitoring data for testing diagram generation'
            });

        } catch (error) {
            console.error('Error getting sample data:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get sample data',
                details: error.message
            });
        }
    }

    /**
     * Generate diagram with sample data for testing
     * POST /api/energy-diagram/generate-sample
     */
    async generateSample(req, res) {
        try {
            const { saveToFile = false } = req.body;
            const sampleData = this.diagramGenerator.generateSampleData();

            // Generate diagram commands
            const result = await this.diagramGenerator.generateDiagramCommands(
                sampleData,
                {
                    projectId: 'sample',
                    projectName: 'Sample Energy Monitoring Project'
                }
            );

            // Save to file if requested
            let fileInfo = null;
            if (saveToFile) {
                fileInfo = await this.diagramGenerator.saveCommandsToFile(
                    result.commands,
                    result.metadata,
                    'sample'
                );
            }

            res.json({
                success: true,
                commands: result.commands,
                metadata: result.metadata,
                nodePositions: result.nodePositions,
                nodeIds: result.nodeIds,
                sampleData,
                fileInfo,
                executionInstructions: {
                    description: 'Execute these commands in sequence on the frontend diagram engine',
                    commandFormat: 'Each command follows the diagram programming language specification',
                    totalCommands: result.commands.length
                }
            });

        } catch (error) {
            console.error('Error generating sample diagram:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to generate sample diagram',
                details: error.message
            });
        }
    }

    /**
     * Validate energy monitoring data structure
     * POST /api/energy-diagram/validate
     */
    async validateData(req, res) {
        try {
            const { energyMonitoringData } = req.body;

            if (!energyMonitoringData || !Array.isArray(energyMonitoringData)) {
                return res.status(400).json({
                    success: false,
                    error: 'energyMonitoringData must be provided as an array'
                });
            }

            const validationResults = [];
            const supportedTypes = Object.keys(this.diagramGenerator.nodeTypes);

            energyMonitoringData.forEach((meter, index) => {
                const validation = {
                    index,
                    id: meter._id || meter.id,
                    valid: true,
                    errors: [],
                    warnings: []
                };

                // Check required fields
                if (!meter.monitoringDeviceType) {
                    validation.valid = false;
                    validation.errors.push('monitoringDeviceType is required');
                }

                if (!meter.label) {
                    validation.warnings.push('label is recommended for better diagram readability');
                }

                // Check if device type is supported
                if (meter.monitoringDeviceType && !supportedTypes.includes(meter.monitoringDeviceType)) {
                    validation.valid = false;
                    validation.errors.push(`Unsupported device type: ${meter.monitoringDeviceType}. Supported types: ${supportedTypes.join(', ')}`);
                }

                validationResults.push(validation);
            });

            const isValid = validationResults.every(result => result.valid);
            const errorCount = validationResults.reduce((count, result) => count + result.errors.length, 0);
            const warningCount = validationResults.reduce((count, result) => count + result.warnings.length, 0);

            res.json({
                success: true,
                valid: isValid,
                summary: {
                    totalItems: energyMonitoringData.length,
                    validItems: validationResults.filter(r => r.valid).length,
                    invalidItems: validationResults.filter(r => !r.valid).length,
                    errorCount,
                    warningCount
                },
                validationResults,
                supportedDeviceTypes: supportedTypes
            });

        } catch (error) {
            console.error('Error validating energy monitoring data:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to validate data',
                details: error.message
            });
        }
    }
}

// Create instance and export methods
const energyDiagramController = new EnergyDiagramController();

module.exports = {
    generateFromProject: energyDiagramController.generateFromProject.bind(energyDiagramController),
    generateFromData: energyDiagramController.generateFromData.bind(energyDiagramController),
    getSampleData: energyDiagramController.getSampleData.bind(energyDiagramController),
    generateSample: energyDiagramController.generateSample.bind(energyDiagramController),
    validateData: energyDiagramController.validateData.bind(energyDiagramController)
}; 