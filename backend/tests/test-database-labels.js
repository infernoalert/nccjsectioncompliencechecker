const mongoose = require('mongoose');
const { model: EnergyMonitoring } = require('../models/EnergyMonitoring');

async function testDatabaseLabels() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/ncc-compliance');
        console.log('✅ Connected to MongoDB (ncc-compliance database)');

        // Get sample devices
        const devices = await EnergyMonitoring.find({}).limit(10);
        console.log(`\n📊 Found ${devices.length} devices in total`);

        console.log('\n=== Sample Device Details ===');
        devices.forEach((device, index) => {
            console.log(`\n${index + 1}. Device Details:`);
            console.log(`   🆔 ID: ${device._id}`);
            console.log(`   🏷️  Label: "${device.label}"`);
            console.log(`   📱 Type: "${device.monitoringDeviceType}"`);
            console.log(`   ⚡ Capacity: ${device.capacity || 'undefined'}`);
            console.log(`   📋 Panel: "${device.panel || 'undefined'}"`);
            console.log(`   🎯 Priority: ${device.priority || 'undefined'}`);
            console.log(`   ⚠️  Critical: ${device.critical || 'undefined'}`);
            console.log(`   📍 Location: ${device.location || 'undefined'}`);
            console.log(`   🔗 ConnectionType: ${device.connectionType || 'undefined'}`);
        });

        console.log('\n=== Label Analysis ===');
        const labelStats = {
            withLabels: 0,
            emptyLabels: 0,
            undefinedLabels: 0,
            uniqueLabels: new Set()
        };

        devices.forEach(device => {
            if (device.label === undefined || device.label === null) {
                labelStats.undefinedLabels++;
            } else if (device.label === '' || device.label.trim() === '') {
                labelStats.emptyLabels++;
            } else {
                labelStats.withLabels++;
                labelStats.uniqueLabels.add(device.label);
            }
        });

        console.log(`📊 Devices with valid labels: ${labelStats.withLabels}`);
        console.log(`📊 Devices with empty labels: ${labelStats.emptyLabels}`);
        console.log(`📊 Devices with undefined labels: ${labelStats.undefinedLabels}`);
        console.log(`📊 Unique labels: ${Array.from(labelStats.uniqueLabels).join(', ')}`);

        console.log('\n=== Testing Fallback Logic ===');
        devices.slice(0, 3).forEach((device, index) => {
            const label = device.label;
            const fallbackLabel = device.monitoringDeviceType ? 
                device.monitoringDeviceType.replace('-', ' ').toUpperCase() : 
                'UNKNOWN';
            
            // Test the same logic as in EnergyDiagramGenerator
            const deviceLabel = (label && label.trim()) ? label : fallbackLabel;
            
            console.log(`\n${index + 1}. Fallback Test:`);
            console.log(`   Raw label: "${label}"`);
            console.log(`   Label exists: ${!!label}`);
            console.log(`   Label has content: ${!!(label && label.trim())}`);
            console.log(`   Fallback: "${fallbackLabel}"`);
            console.log(`   Final result: "${deviceLabel}"`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
        process.exit();
    }
}

testDatabaseLabels(); 