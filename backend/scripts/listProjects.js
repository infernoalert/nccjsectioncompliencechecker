/**
 * Script to list all projects in the database
 */

const mongoose = require('mongoose');
const Project = require('../models/Project');

async function listProjects() {
    try {
        console.log('Fetching all projects...');
        
        const projects = await Project.find({})
            .select('_id name description buildingType location floorArea')
            .populate('electrical.energyMonitoring', 'label panel monitoringDeviceType');
        
        console.log(`\nFound ${projects.length} projects:\n`);
        
        projects.forEach((project, index) => {
            console.log(`${index + 1}. Project: ${project.name || 'Unnamed'}`);
            console.log(`   ID: ${project._id}`);
            console.log(`   Building Type: ${project.buildingType || 'Not specified'}`);
            console.log(`   Location: ${project.location || 'Not specified'}`);
            console.log(`   Floor Area: ${project.floorArea || 'Not specified'}`);
            
            const deviceCount = project.electrical?.energyMonitoring?.length || 0;
            console.log(`   Energy Monitoring Devices: ${deviceCount}`);
            
            if (deviceCount > 0) {
                project.electrical.energyMonitoring.forEach((device, i) => {
                    console.log(`     ${i + 1}. ${device.label} (${device.monitoringDeviceType}) - Panel: ${device.panel}`);
                });
            }
            console.log('');
        });
        
        if (projects.length > 0) {
            console.log(`\n🎯 To add sample devices to a project, use:`);
            console.log(`node addSampleEnergyDevices.js ${projects[0]._id}`);
            console.log(`\n🔧 Or to update existing devices for all projects:`);
            console.log(`node updateExistingDevices.js`);
        }
        
    } catch (error) {
        console.error('Error listing projects:', error);
        throw error;
    }
}

// Function to run from command line
async function main() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/your-db-name');
        console.log('Connected to MongoDB');

        await listProjects();

    } catch (error) {
        console.error('Script failed:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('Disconnected from MongoDB');
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { listProjects }; 