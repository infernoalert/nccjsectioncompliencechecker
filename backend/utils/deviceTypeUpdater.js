const EnergyMonitoring = require('../models/EnergyMonitoring').model;
const Project = require('../models/Project');

async function updateDeviceTypesByProjectSize(projectId) {
  try {
    const project = await Project.findById(projectId);
    if (!project) throw new Error('Project not found');

    const size = project.floorArea || 0;
    let newType;
    if (size >= 2500) newType = 'smart-meter';
    else if (size >= 500) newType = 'memory-meter';
    else newType = 'general-meter';

    console.log(`Updating device types for project size ${size} to ${newType}`);

    // Update all energy monitoring devices except Auth meter
    const devices = await EnergyMonitoring.find({ _id: { $in: project.electrical.energyMonitoring } });
    console.log(`Found ${devices.length} devices to update`);
    
    let updated = 0;
    for (const device of devices) {
      if (device.monitoringDeviceType !== 'auth-meter') {
        console.log(`Updating device ${device.label} from ${device.monitoringDeviceType} to ${newType}`);
        device.monitoringDeviceType = newType;
        await device.save();
        updated++;
      }
    }

    // Save the project to ensure references are updated
    await project.save();
    console.log(`Updated ${updated} devices to ${newType}`);

    return { updatedType: newType, count: updated };
  } catch (error) {
    console.error('Error updating device types:', error);
    throw error;
  }
}

module.exports = updateDeviceTypesByProjectSize; 