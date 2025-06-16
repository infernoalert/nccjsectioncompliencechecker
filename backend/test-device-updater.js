const mongoose = require('mongoose');
const updateDeviceTypesByProjectSize = require('./utils/deviceTypeUpdater');
const connectDB = require('./config/db');
const path = require('path');

// Load env vars the same way as server.js
const dotenv = require('dotenv');
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

async function testDeviceTypeUpdater() {
    try {
        console.log('🧪 TESTING DEVICE TYPE UPDATER');
        console.log('Connecting to database...');
        
        const dbConnection = await connectDB();
        if (!dbConnection) {
            throw new Error('Failed to connect to database');
        }
        console.log('✅ Connected to database');
        
        const projectId = process.argv[2];
        if (!projectId) {
            console.error('❌ Please provide a project ID');
            console.log('Usage: node test-device-updater.js <projectId>');
            process.exit(1);
        }
        
        console.log('📋 Testing with Project ID:', projectId);
        
        const result = await updateDeviceTypesByProjectSize(projectId);
        
        console.log('🎉 Test completed successfully!');
        console.log('Result:', result);
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        console.error('Stack:', error.stack);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
}

testDeviceTypeUpdater(); 