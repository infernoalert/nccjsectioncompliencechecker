const mongoose = require('mongoose');

const energyMonitoringSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true
    },
    panel: {
        type: String,
        required: true
    },
    type: {
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
}, {
    timestamps: true,
    _id: false // Disable _id for embedded documents
});

// Remove the compound index since this is an embedded schema
// The uniqueness will be enforced at the application level

module.exports = {
    embeddedSchema: energyMonitoringSchema,
    schema: new mongoose.Schema(energyMonitoringSchema),
    model: mongoose.model('EnergyMonitoring', energyMonitoringSchema)
}; 