const mongoose = require('mongoose');

const energyMonitoringSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true,
        index: true
    },
    panel: {
        type: String,
        required: true,
        index: true
    },
    type: {
        type: String,
        required: true,
        enum: ['smart meter', 'energy meter', 'power meter', 'current transformer', 'voltage transformer']
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
}, {
    timestamps: true
});

// Compound index for unique device identification
energyMonitoringSchema.index({ label: 1, panel: 1 }, { unique: true });

module.exports = {
    embeddedSchema: energyMonitoringSchema,
    schema: new mongoose.Schema(energyMonitoringSchema),
    model: mongoose.model('EnergyMonitoring', energyMonitoringSchema)
}; 