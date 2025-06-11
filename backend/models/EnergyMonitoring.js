const mongoose = require('mongoose');

// Define the base schema fields
const energyMonitoringFields = {
    label: {
        type: String,
        required: true,
        index: true  // Keep index for performance but not unique
    },
    panel: {
        type: String,
        required: true,
        index: true  // Keep index for performance but not unique
    },
    monitoringDeviceType: {
        type: String,
        required: true,
        enum: ['smart-meter', 'general-meter', 'auth-meter', 'memory-meter']
    },
    description: {
        type: String,
        default: ''
    },
    connection: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'maintenance'],
        default: 'active'
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
};

// Standalone schema (for collection, allows _id)
const energyMonitoringSchema = new mongoose.Schema(energyMonitoringFields, {
    timestamps: true
});

// Remove any existing unique indexes
energyMonitoringSchema.index({ label: 1, panel: 1 }, { unique: false });

// Embedded schema (for embedding, disables _id)
const embeddedEnergyMonitoringSchema = new mongoose.Schema(energyMonitoringFields, {
    timestamps: true,
    _id: false
});

module.exports = {
    embeddedSchema: embeddedEnergyMonitoringSchema,
    schema: energyMonitoringSchema,
    model: mongoose.model('EnergyMonitoring', energyMonitoringSchema)
}; 