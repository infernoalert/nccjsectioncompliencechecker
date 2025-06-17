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
        enum: ['active', 'inactive', 'maintenance', 'warning', 'error'],
        default: 'active'
    },
    // Additional fields for rule-based diagram generation
    capacity: {
        type: Number,
        default: 1000,  // Default capacity in watts
        min: 0
    },
    priority: {
        type: String,
        enum: ['low', 'normal', 'high'],
        default: 'normal'
    },
    critical: {
        type: Boolean,
        default: false
    },
    location: {
        type: String,
        default: ''
    },
    connectionType: {
        type: String,
        enum: ['wireless', 'ethernet', 'rs485'],
        default: function() {
            // Default connection type based on device type
            switch(this.monitoringDeviceType) {
                case 'smart-meter': return 'wireless';
                case 'auth-meter': return 'ethernet';
                default: return 'rs485';
            }
        }
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