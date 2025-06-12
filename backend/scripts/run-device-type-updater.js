const updateDeviceTypesByProjectSize = require('../utils/deviceTypeUpdater');
const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Standalone Device Type Updater
 * 
 * This script runs independently AFTER the MCP process completes.
 * It updates device types based on project size:
 * - >= 2500 sq ft: smart-meter
 * - >= 500 sq ft: memory-meter  
 * - < 500 sq ft: general-meter
 * 
 * Usage: node run-device-type-updater.js <projectId>
 */

async function runDeviceTypeUpdater(projectId) {
    try {
        console.log('=== Device Type Updater (Post-MCP) ===\n');
        
        if (!projectId) {
            throw new Error('Project ID is required. Usage: node run-device-type-updater.js <projectId>');
        }
        
        // Connect to MongoDB
        console.log('1. Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('   ✅ Connected to database\n');
        
        // Run device type updater
        console.log('2. Running device type updater...');
        console.log(`   📋 Project ID: ${projectId}`);
        
        const result = await updateDeviceTypesByProjectSize(projectId);
        
        console.log('   ✅ Device type update completed');
        console.log(`   📊 Updated ${result.count} devices to type: ${result.updatedType}\n`);
        
        console.log('=== Device Type Update Process Completed ===');
        console.log('✅ All devices updated based on project size');
        console.log('✅ Process completed independently from MCP\n');
        
        return result;
        
    } catch (error) {
        console.error('❌ Device type update failed:', error.message);
        throw error;
    } finally {
        // Close database connection
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}

// Command line execution
if (require.main === module) {
    const projectId = process.argv[2];
    
    runDeviceTypeUpdater(projectId)
        .then(result => {
            console.log('\n🎉 Success! Device types updated successfully');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Failed to update device types:', error.message);
            process.exit(1);
        });
}

module.exports = { runDeviceTypeUpdater }; 