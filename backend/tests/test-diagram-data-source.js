const mongoose = require('mongoose');
const Project = require('../models/Project');
const { model: EnergyMonitoring } = require('../models/EnergyMonitoring');

async function testDiagramDataSource() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/ncc-compliance');
        console.log('✅ Connected to MongoDB (ncc-compliance database)');

        const projectId = '684a53d0312f7c81654304c4';
        console.log(`\n🔍 Testing data source for project: ${projectId}`);

        // Test 1: Get project with populated energy monitoring (same as controller)
        console.log('\n=== Test 1: Project.findById with populate ===');
        const project = await Project.findById(projectId)
            .populate('electrical.energyMonitoring');
        
        if (project) {
            console.log(`✅ Project found: ${project.projectName}`);
            console.log(`📊 Electrical data exists: ${!!project.electrical}`);
            
            if (project.electrical && project.electrical.energyMonitoring) {
                console.log(`📊 Energy monitoring count: ${project.electrical.energyMonitoring.length}`);
                
                if (project.electrical.energyMonitoring.length > 0) {
                    console.log('\n📋 Sample populated devices:');
                    project.electrical.energyMonitoring.slice(0, 3).forEach((device, i) => {
                        console.log(`${i+1}. ID: ${device._id}`);
                        console.log(`   Label: "${device.label}"`);
                        console.log(`   Type: "${device.monitoringDeviceType}"`);
                        console.log(`   Panel: "${device.panel}"`);
                    });
                } else {
                    console.log('❌ No energy monitoring devices in project.electrical.energyMonitoring');
                }
            } else {
                console.log('❌ No electrical.energyMonitoring in project');
            }
        } else {
            console.log('❌ Project not found');
        }

        // Test 2: Fallback query (same as controller fallback)
        console.log('\n=== Test 2: Fallback query - EnergyMonitoring.find() ===');
        const fallbackDevices = await EnergyMonitoring.find({});
        console.log(`📊 Fallback found ${fallbackDevices.length} total devices`);
        
        if (fallbackDevices.length > 0) {
            console.log('\n📋 Sample fallback devices:');
            fallbackDevices.slice(0, 3).forEach((device, i) => {
                console.log(`${i+1}. ID: ${device._id}`);
                console.log(`   Label: "${device.label}"`);
                console.log(`   Type: "${device.monitoringDeviceType}"`);
                console.log(`   Panel: "${device.panel}"`);
            });
        }

        // Test 3: Simulate exactly what the controller does
        console.log('\n=== Test 3: Simulate Controller Logic ===');
        let energyMonitoringData;
        
        if (project && project.electrical && project.electrical.energyMonitoring && project.electrical.energyMonitoring.length > 0) {
            energyMonitoringData = project.electrical.energyMonitoring;
            console.log(`📊 Using project data: ${energyMonitoringData.length} devices`);
        } else {
            energyMonitoringData = await EnergyMonitoring.find({});
            console.log(`📊 Using fallback data: ${energyMonitoringData.length} devices`);
        }

        // Test the exact data that would go to the generator
        console.log('\n=== Final Data for Generator ===');
        energyMonitoringData.slice(0, 5).forEach((device, i) => {
            console.log(`\n${i+1}. Device for Generator:`);
            console.log(`   _id: ${device._id}`);
            console.log(`   label: "${device.label}"`);
            console.log(`   monitoringDeviceType: "${device.monitoringDeviceType}"`);
            console.log(`   capacity: ${device.capacity}`);
            console.log(`   panel: "${device.panel}"`);
            
            // Test the same label logic as EnergyDiagramGenerator
            const deviceLabel = (device.label && device.label.trim()) 
                ? device.label 
                : `${device.monitoringDeviceType.replace('-', ' ').toUpperCase()}`;
            console.log(`   🏷️  Final Label: "${deviceLabel}"`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
        process.exit();
    }
}

testDiagramDataSource(); 