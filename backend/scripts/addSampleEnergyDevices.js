/**
 * Script to add sample energy monitoring devices with different capacities and properties
 * This will help test the rule-based diagram generation system
 */

const mongoose = require('mongoose');
const { model: EnergyMonitoring } = require('../models/EnergyMonitoring');
const Project = require('../models/Project');

// Sample devices with varying properties to test rules
const sampleDevices = [
    {
        label: 'Main Building Smart Meter',
        panel: 'Main Panel',
        monitoringDeviceType: 'smart-meter',
        description: 'Primary smart meter for main building',
        status: 'active',
        capacity: 5000,  // High capacity (>2500) - should use ethernet
        priority: 'high',
        critical: true,
        location: 'building-a',
        connectionType: 'wireless'
    },
    {
        label: 'Secondary Smart Meter',
        panel: 'Panel A',
        monitoringDeviceType: 'smart-meter',
        description: 'Secondary smart meter',
        status: 'active',
        capacity: 2000,  // Normal capacity - should use wireless
        priority: 'normal',
        critical: false,
        location: 'building-a',
        connectionType: 'wireless'
    },
    {
        label: 'High Load General Meter',
        panel: 'Panel B',
        monitoringDeviceType: 'general-meter',
        description: 'High capacity general meter',
        status: 'active',
        capacity: 8000,  // Very high capacity (>2500) - should use ethernet
        priority: 'high',
        critical: false,
        location: 'building-b',
        connectionType: 'rs485'
    },
    {
        label: 'Authority Meter',
        panel: 'Main Panel',
        monitoringDeviceType: 'auth-meter',
        description: 'Official verification meter',
        status: 'active',
        capacity: 3500,  // High capacity (>2500) - should use ethernet
        priority: 'high',
        critical: true,
        location: 'building-a',
        connectionType: 'ethernet'
    },
    {
        label: 'Data Logger 1',
        panel: 'Panel C',
        monitoringDeviceType: 'memory-meter',
        description: 'Memory data logger',
        status: 'warning',
        capacity: 1200,  // Low capacity - should keep rs485
        priority: 'normal',
        critical: false,
        location: 'building-b',
        connectionType: 'rs485'
    },
    {
        label: 'Backup Smart Meter',
        panel: 'Panel A',
        monitoringDeviceType: 'smart-meter',
        description: 'Backup monitoring device',
        status: 'maintenance',
        capacity: 800,   // Low capacity - should use wireless
        priority: 'normal',
        critical: false,
        location: 'building-a',
        connectionType: 'wireless'
    }
];

async function addSampleDevices(projectId) {
    try {
        console.log(`Adding sample energy devices to project: ${projectId}`);
        
        // Find the project
        const project = await Project.findById(projectId);
        if (!project) {
            throw new Error('Project not found');
        }

        console.log(`Found project: ${project.name}`);

        // Clear existing energy monitoring devices
        if (project.electrical && project.electrical.energyMonitoring) {
            console.log(`Removing ${project.electrical.energyMonitoring.length} existing devices`);
            // Delete the actual documents
            for (const deviceId of project.electrical.energyMonitoring) {
                await EnergyMonitoring.findByIdAndDelete(deviceId);
            }
            project.electrical.energyMonitoring = [];
        }

        // Create new sample devices
        const createdDevices = [];
        for (const deviceData of sampleDevices) {
            const device = await EnergyMonitoring.create(deviceData);
            createdDevices.push(device);
            project.electrical.energyMonitoring.push(device._id);
            
            console.log(`Created device: ${device.label} (${device.monitoringDeviceType}, ${device.capacity}W, ${device.connectionType})`);
        }

        // Save project
        project.markModified('electrical.energyMonitoring');
        await project.save();

        console.log(`\n✅ Successfully added ${createdDevices.length} sample devices to project`);
        console.log('\nDevices summary:');
        createdDevices.forEach((device, index) => {
            console.log(`${index + 1}. ${device.label}`);
            console.log(`   Type: ${device.monitoringDeviceType}`);
            console.log(`   Capacity: ${device.capacity}W ${device.capacity > 2500 ? '(HIGH - should use ethernet)' : '(normal)'}`);
            console.log(`   Priority: ${device.priority}, Critical: ${device.critical}`);
            console.log(`   Status: ${device.status}, Location: ${device.location}`);
            console.log(`   Connection: ${device.connectionType}\n`);
        });

        console.log('🚀 Now test the diagram generation to see the rules in action!');
        
        return createdDevices;

    } catch (error) {
        console.error('Error adding sample devices:', error);
        throw error;
    }
}

// Function to run from command line
async function main() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/your-db-name');
        console.log('Connected to MongoDB');

        // Get project ID from command line arguments
        const projectId = process.argv[2];
        if (!projectId) {
            console.log('Usage: node addSampleEnergyDevices.js <projectId>');
            console.log('Example: node addSampleEnergyDevices.js 67890abcdef1234567890123');
            process.exit(1);
        }

        await addSampleDevices(projectId);

    } catch (error) {
        console.error('Script failed:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('Disconnected from MongoDB');
    }
}

// Export function for use in other scripts
module.exports = { addSampleDevices, sampleDevices };

// Run if called directly
if (require.main === module) {
    main();
} 