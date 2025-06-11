const mongoose = require('mongoose');
const { model: EnergyMonitoring } = require('../models/EnergyMonitoring');

async function dropIndexes() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ncc-compliance');
        console.log('Connected to MongoDB');

        // Drop the unique index
        await EnergyMonitoring.collection.dropIndex('label_1_panel_1');
        console.log('Successfully dropped unique index on label and panel');

        // Create new non-unique index
        await EnergyMonitoring.collection.createIndex({ label: 1, panel: 1 }, { unique: false });
        console.log('Successfully created new non-unique index on label and panel');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

dropIndexes(); 