const mongoose = require('mongoose');
const Project = require('../models/Project');
const ProjectUpdater = require('../mcp/processors/ProjectUpdater');

async function manualTest() {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nccj');
        console.log('Connected to database');

        // Create a test project with all required fields
        const project = await Project.create({
            name: 'Manual Test Project',
            floorArea: 1000, // Required
            climateZone: 'Zone_3', // Required
            location: 'Sydney', // Required
            buildingType: 'Class_5', // Required
            owner: new mongoose.Types.ObjectId(), // Required
            createdBy: new mongoose.Types.ObjectId(), // Required
            electrical: {
                loads: [],
                energyMonitoring: []
            },
            mcp: {
                currentStep: 'initial',
                lastUpdated: new Date(),
                history: [],
                analysisResults: {
                    hasAirConditioning: null,
                    lastAnalyzed: null,
                    rawAnalysis: null
                },
                processingStatus: 'pending'
            }
        });
        console.log('Created test project:', project._id);

        // Create project updater
        const projectUpdater = new ProjectUpdater(project._id);

        // Sample document data (this would normally come from document processing)
        const extractedData = {
            hasAirConditioning: true,
            acType: 'Split System',
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

        // Process and update the project
        console.log('Processing document data...');
        const result = await projectUpdater.updateProject(extractedData);
        console.log('Update result:', result);

        // Verify the update
        const updatedProject = await Project.findById(project._id)
            .populate('electrical.energyMonitoring');
        
        console.log('\nUpdated Project:');
        console.log('Status:', updatedProject.complianceStatus);
        
        console.log('\nMCP Analysis Results:');
        if (updatedProject.mcp && updatedProject.mcp.analysisResults) {
            const analysis = updatedProject.mcp.analysisResults;
            console.log('Has Air Conditioning:', analysis.hasAirConditioning);
            console.log('Last Analyzed:', analysis.lastAnalyzed);
            if (analysis.rawAnalysis) {
                console.log('\nAnalysis Details:');
                console.log('- AC Type:', analysis.rawAnalysis.acType);
                console.log('- AC Location:', analysis.rawAnalysis.acLocation);
                console.log('- Requirements:', analysis.rawAnalysis.requirements.join(', '));
                console.log('- Other Systems:', analysis.rawAnalysis.otherSystems.join(', '));
            }
        } else {
            console.log('No analysis results found in MCP data');
        }

        console.log('\nElectrical Data:');
        if (updatedProject.electrical && updatedProject.electrical.energyMonitoring) {
            const monitoringSystems = updatedProject.electrical.energyMonitoring;
            console.log('Energy Monitoring Systems:', monitoringSystems.length);
            monitoringSystems.forEach((monitoring, index) => {
                if (monitoring) {
                    console.log(`\nSystem ${index + 1}:`);
                    console.log(`- Name: ${monitoring.name}`);
                    console.log(`- Part Number: ${monitoring.partNumber}`);
                    console.log(`- Type: ${monitoring.systemType}`);
                    console.log(`- Description: ${monitoring.description}`);
                    console.log(`- Manufacturer: ${monitoring.manufacturer}`);
                    if (monitoring.specifications) {
                        console.log('- Specifications:');
                        Object.entries(monitoring.specifications).forEach(([key, value]) => {
                            console.log(`  ${key}: ${value}`);
                        });
                    }
                }
            });
        } else {
            console.log('No energy monitoring data found');
        }

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        // Cleanup
        await mongoose.connection.close();
        console.log('\nTest completed');
    }
}

// Run the test
manualTest(); 