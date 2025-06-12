const mongoose = require('mongoose');
const Project = require('./models/Project');

async function cleanupElectricals() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nccjsectioncompliencechecker');
        console.log('Connected to MongoDB');

        // Find all projects that have the 'electricals' field
        const projectsWithElectricals = await Project.find({ electricals: { $exists: true } });
        console.log(`Found ${projectsWithElectricals.length} projects with 'electricals' field`);

        // Remove the 'electricals' field from all projects
        const result = await Project.updateMany(
            { electricals: { $exists: true } },
            { $unset: { electricals: "" } }
        );

        console.log(`Removed 'electricals' field from ${result.modifiedCount} projects`);

        // Verify cleanup
        const remainingProjects = await Project.find({ electricals: { $exists: true } });
        console.log(`Remaining projects with 'electricals' field: ${remainingProjects.length}`);

        console.log('Cleanup completed successfully!');
    } catch (error) {
        console.error('Error during cleanup:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
}

// Run the cleanup
cleanupElectricals(); 