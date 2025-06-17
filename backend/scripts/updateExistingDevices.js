/**
 * Script to update existing energy monitoring devices with new fields for rule-based system
 */

const mongoose = require('mongoose');
const { model: EnergyMonitoring } = require('../models/EnergyMonitoring');

async function updateExistingDevices() {
    try {
        console.log('Updating existing energy monitoring devices...');
        console.log('Database:', mongoose.connection.db.databaseName);
        console.log('Collection: energymonitorings');
        
        const devices = await EnergyMonitoring.find({});
        console.log(`Found ${devices.length} devices to update`);
        
        if (devices.length === 0) {
            console.log('❌ No devices found. Check database connection and collection name.');
            return;
        }

        for (let i = 0; i < devices.length; i++) {
            const device = devices[i];
            
            // Add missing fields with smart defaults
            const updates = {};
            
            if (device.capacity === undefined || device.capacity === null) {
                // Assign varying capacities to test rules
                updates.capacity = i % 3 === 0 ? 3000 : (i % 3 === 1 ? 5000 : 1500);
            }
            
            if (device.priority === undefined || device.priority === null) {
                updates.priority = i % 2 === 0 ? 'high' : 'normal';
            }
            
            if (device.critical === undefined || device.critical === null) {
                updates.critical = i % 4 === 0; // Every 4th device is critical
            }
            
            if (!device.location) {
                updates.location = i % 2 === 0 ? 'building-a' : 'building-b';
            }
            
            if (!device.connectionType) {
                // Set based on device type
                switch(device.monitoringDeviceType) {
                    case 'smart-meter': 
                        updates.connectionType = 'wireless';
                        break;
                    case 'auth-meter': 
                        updates.connectionType = 'ethernet';
                        break;
                    default: 
                        updates.connectionType = 'rs485';
                }
            }

            // Only update if there are changes
            if (Object.keys(updates).length > 0) {
                await EnergyMonitoring.findByIdAndUpdate(device._id, updates);
                console.log(`✅ Updated: ${device.label} (${device.monitoringDeviceType})`);
                console.log(`   Capacity: ${updates.capacity || 'unchanged'}W, Critical: ${updates.critical || 'unchanged'}, Priority: ${updates.priority || 'unchanged'}`);
                console.log(`   Location: ${updates.location || 'unchanged'}, Connection: ${updates.connectionType || 'unchanged'}`);
            } else {
                console.log(`⏭️  Skipped: ${device.label} (already has all fields)`);
            }
        }

        console.log(`\n✅ Successfully updated ${devices.length} devices with rule-compatible fields`);
        console.log('\n🚀 Now test the diagram generation to see the rules in action!');
        
    } catch (error) {
        console.error('Error updating devices:', error);
        throw error;
    }
}

// Function to run from command line
async function main() {
    try {
        // Connect to MongoDB - specifically to ncc-compliance database
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ncc-compliance');
        console.log('Connected to MongoDB (ncc-compliance database)');

        await updateExistingDevices();

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

module.exports = { updateExistingDevices }; 