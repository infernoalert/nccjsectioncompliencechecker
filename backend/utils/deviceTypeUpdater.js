const EnergyMonitoring = require('../models/EnergyMonitoring').model;
const Project = require('../models/Project');

async function updateDeviceTypesByProjectSize(projectId) {
  try {
    console.log('🔧 DEVICE TYPE UPDATER STARTED');
    console.log('📋 Project ID:', projectId);
    
    const project = await Project.findById(projectId).populate('electrical.energyMonitoring');
    if (!project) {
      console.error('❌ Project not found:', projectId);
      throw new Error('Project not found');
    }

    console.log('✅ Project found:', {
      name: project.name,
      floorArea: project.floorArea,
      energyMonitoringDeviceCount: project.electrical.energyMonitoring.length
    });

    const size = project.floorArea || 0;
    let newType;
    if (size >= 2500) newType = 'smart-meter';
    else if (size >= 500) newType = 'memory-meter';
    else newType = 'general-meter';

    console.log(`📐 Project size: ${size} sq ft → Device type: ${newType}`);

    // Log current device types before update
    console.log('📊 Current device details:');
    project.electrical.energyMonitoring.forEach((device, index) => {
      console.log(`  ${index + 1}. Label: "${device.label}", Panel: "${device.panel}", Current Type: "${device.monitoringDeviceType}"`);
    });

    // Update all energy monitoring devices except Auth meter
    const devices = await EnergyMonitoring.find({ _id: { $in: project.electrical.energyMonitoring } });
    console.log(`🔍 Found ${devices.length} devices in database to update`);
    
    if (devices.length === 0) {
      console.log('⚠️  No devices found to update. Project may not have energy monitoring devices.');
      return { updatedType: newType, count: 0 };
    }
    
    let updated = 0;
    for (const device of devices) {
      console.log(`🔄 Processing device: "${device.label}" (${device.panel})`);
      console.log(`   Current type: ${device.monitoringDeviceType}`);
      
      if (device.monitoringDeviceType !== 'auth-meter') {
        if (device.monitoringDeviceType !== newType) {
          console.log(`   ✏️  Updating from ${device.monitoringDeviceType} to ${newType}`);
          device.monitoringDeviceType = newType;
          await device.save();
          updated++;
          console.log(`   ✅ Device updated successfully`);
        } else {
          console.log(`   ⏭️  Device already has correct type (${newType}), skipping`);
        }
      } else {
        console.log(`   🔒 Auth meter detected, skipping update`);
      }
    }

    // Save the project to ensure references are updated
    await project.save();
    console.log(`🎯 Final Summary: Updated ${updated} devices to ${newType}`);
    console.log('✅ DEVICE TYPE UPDATER COMPLETED');

    return { updatedType: newType, count: updated };
  } catch (error) {
    console.error('❌ DEVICE TYPE UPDATER ERROR:', error);
    console.error('Stack trace:', error.stack);
    throw error;
  }
}

module.exports = updateDeviceTypesByProjectSize; 