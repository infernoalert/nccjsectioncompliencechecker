/**
 * Script to check what collections exist in the database and show sample data
 */

const mongoose = require('mongoose');

async function checkDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/your-db-name');
        console.log('Connected to MongoDB');

        // Get database instance
        const db = mongoose.connection.db;
        
        // List all collections
        const collections = await db.listCollections().toArray();
        console.log('\n📋 Available Collections:');
        console.log('========================');
        
        for (const collection of collections) {
            console.log(`- ${collection.name}`);
            
            // Count documents in each collection
            const count = await db.collection(collection.name).countDocuments();
            console.log(`  Documents: ${count}`);
            
            // Show sample document if any exist
            if (count > 0) {
                const sample = await db.collection(collection.name).findOne();
                console.log(`  Sample:`, JSON.stringify(sample, null, 2).substring(0, 200) + '...');
            }
            console.log('');
        }

        // Specifically check for energy monitoring related collections
        console.log('\n🔍 Looking for Energy Monitoring Data:');
        console.log('=====================================');
        
        const energyCollections = collections.filter(c => 
            c.name.toLowerCase().includes('energy') || 
            c.name.toLowerCase().includes('monitor') ||
            c.name.toLowerCase().includes('electrical')
        );
        
        if (energyCollections.length === 0) {
            console.log('❌ No energy monitoring collections found');
        } else {
            for (const collection of energyCollections) {
                console.log(`\n📊 Collection: ${collection.name}`);
                const docs = await db.collection(collection.name).find({}).limit(3).toArray();
                console.log(`Sample documents (${docs.length}):`, JSON.stringify(docs, null, 2));
            }
        }

        // Check projects to see if they have energy monitoring data
        console.log('\n🎯 Checking Projects for Energy Data:');
        console.log('====================================');
        
        const projects = await db.collection('projects').find({}).limit(3).toArray();
        console.log(`Found ${projects.length} projects`);
        
        for (const project of projects) {
            console.log(`\nProject: ${project.projectName} (ID: ${project._id})`);
            if (project.energyMonitoring && project.energyMonitoring.length > 0) {
                console.log(`  Energy Devices: ${project.energyMonitoring.length}`);
                console.log(`  Sample Device:`, JSON.stringify(project.energyMonitoring[0], null, 2));
            } else {
                console.log(`  No energy monitoring data found`);
            }
        }

    } catch (error) {
        console.error('Error checking database:', error);
        throw error;
    } finally {
        await mongoose.connection.close();
        console.log('\nDisconnected from MongoDB');
    }
}

// Run if called directly
if (require.main === module) {
    checkDatabase();
}

module.exports = { checkDatabase }; 