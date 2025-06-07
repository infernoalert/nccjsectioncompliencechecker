const mongoose = require('mongoose');
const ProjectUpdater = require('../mcp/processors/ProjectUpdater');
const Project = require('../models/Project');
const { model: EnergyMonitoring } = require('../models/EnergyMonitoring');

describe('ProjectUpdater', () => {
    let projectId;
    let projectUpdater;

    beforeAll(async () => {
        // Connect to test database
        await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/nccj_test');
    });

    afterAll(async () => {
        // Clean up and disconnect
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        // Create a test project
        const project = await Project.create({
            name: 'Test Project',
            status: 'PENDING',
            analysisResults: {}
        });
        projectId = project._id;
        projectUpdater = new ProjectUpdater(projectId);
    });

    afterEach(async () => {
        // Clean up test data
        await Project.deleteMany({});
        await EnergyMonitoring.deleteMany({});
    });

    test('should update project with energy monitoring data', async () => {
        // Sample analysis data
        const analysis = {
            hasAirConditioning: true,
            acType: 'Central',
            acLocation: 'Roof',
            requirements: ['Cooling', 'Ventilation'],
            otherSystems: ['HVAC'],
            energyMonitoring: {
                systemType: 'Building Energy Management',
                name: 'BEMS-2000',
                partNumber: 'BEMS-2000-001',
                description: 'Advanced building energy monitoring system',
                manufacturer: 'EnergyTech',
                specifications: {
                    voltage: '220V',
                    power: '100W',
                    communication: 'Modbus TCP/IP'
                }
            }
        };

        // Validate the update
        const isValid = await projectUpdater.validateUpdate(analysis);
        expect(isValid).toBe(true);

        // Update the project
        const result = await projectUpdater.updateProject(analysis);
        expect(result.success).toBe(true);

        // Verify project was updated
        const updatedProject = await Project.findById(projectId).populate('energyMonitoring');
        expect(updatedProject.status).toBe('ANALYZED');
        expect(updatedProject.analysisResults.hasAirConditioning).toBe(true);
        expect(updatedProject.energyMonitoring).toBeDefined();
        expect(updatedProject.energyMonitoring.systemType).toBe('Building Energy Management');
        expect(updatedProject.energyMonitoring.partNumber).toBe('BEMS-2000-001');
    });

    test('should handle invalid energy monitoring data', async () => {
        const invalidAnalysis = {
            hasAirConditioning: true,
            energyMonitoring: {
                // Missing required fields
                description: 'Test system'
            }
        };

        const isValid = await projectUpdater.validateUpdate(invalidAnalysis);
        expect(isValid).toBe(false);
    });

    test('should get project status with energy monitoring data', async () => {
        // First update the project with data
        const analysis = {
            hasAirConditioning: true,
            energyMonitoring: {
                systemType: 'Building Energy Management',
                name: 'BEMS-2000',
                partNumber: 'BEMS-2000-001',
                description: 'Test system',
                manufacturer: 'EnergyTech',
                specifications: {}
            }
        };

        await projectUpdater.updateProject(analysis);

        // Get project status
        const status = await projectUpdater.getProjectStatus();
        expect(status.success).toBe(true);
        expect(status.status).toBe('ANALYZED');
        expect(status.energyMonitoring).toBeDefined();
        expect(status.energyMonitoring.systemType).toBe('Building Energy Management');
    });
}); 