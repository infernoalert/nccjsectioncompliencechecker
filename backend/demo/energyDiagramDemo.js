const EnergyDiagramGenerator = require('../services/energyDiagramGenerator');
const fs = require('fs').promises;
const path = require('path');

// Demo function to showcase the energy diagram generator
async function runEnergyDiagramDemo() {
    console.log('🚀 Energy Diagram Generator Demo\n');
    console.log('=' .repeat(50));

    try {
        // Initialize the generator
        const generator = new EnergyDiagramGenerator();
        console.log('✅ Generator initialized successfully');

        // Step 1: Generate sample energy monitoring data
        console.log('\n📊 Step 1: Generating sample energy monitoring data...');
        const sampleData = generator.generateSampleData();
        
        console.log('Sample Energy Monitoring Data:');
        sampleData.forEach((meter, index) => {
            console.log(`  ${index + 1}. ${meter.label} (${meter.monitoringDeviceType}) - ${meter.panel}`);
        });

        // Step 2: Generate diagram commands
        console.log('\n🔧 Step 2: Generating diagram commands...');
        const result = await generator.generateDiagramCommands(sampleData, {
            projectId: 'demo-project-123',
            projectName: 'Demo Energy Monitoring Project'
        });

        console.log(`✅ Generated ${result.commands.length} commands`);

        // Step 3: Display the generated commands
        console.log('\n📋 Step 3: Generated Commands:');
        console.log('-'.repeat(40));
        result.commands.forEach((command, index) => {
            console.log(`${String(index + 1).padStart(2, '0')}. ${command}`);
        });

        // Step 4: Display metadata
        console.log('\n📈 Step 4: Metadata:');
        console.log('-'.repeat(40));
        console.log(`Generated At: ${result.metadata.generatedAt}`);
        console.log(`Diagram Type: ${result.metadata.diagramType}`);
        console.log(`Node Count: ${result.metadata.nodeCount}`);
        console.log(`Meter Types: ${result.metadata.meterTypes.join(', ')}`);
        console.log(`Project ID: ${result.metadata.projectId}`);
        console.log(`Project Name: ${result.metadata.projectName}`);

        // Step 5: Display node positions
        console.log('\n🎯 Step 5: Node Positions:');
        console.log('-'.repeat(40));
        Object.entries(result.nodePositions).forEach(([nodeId, position]) => {
            console.log(`${nodeId}: (${position.x}, ${position.y})`);
        });

        // Step 6: Save to file
        console.log('\n💾 Step 6: Saving to file...');
        const fileResult = await generator.saveCommandsToFile(
            result.commands,
            result.metadata,
            'demo-project-123'
        );

        console.log(`✅ File saved successfully!`);
        console.log(`📁 Filename: ${fileResult.filename}`);
        console.log(`📂 Full path: ${fileResult.filePath}`);

        // Step 7: Verify file content
        console.log('\n🔍 Step 7: Verifying saved file...');
        const fileContent = await fs.readFile(fileResult.filePath, 'utf8');
        const parsedContent = JSON.parse(fileContent);
        
        console.log(`✅ File verification successful`);
        console.log(`Commands in file: ${parsedContent.commands.length}`);
        console.log(`Metadata present: ${parsedContent.metadata ? 'Yes' : 'No'}`);
        console.log(`Execution instructions: ${parsedContent.executionInstructions ? 'Yes' : 'No'}`);

        // Step 8: Display execution instructions
        console.log('\n🎮 Step 8: Frontend Execution Instructions:');
        console.log('-'.repeat(40));
        console.log('To execute these commands on the frontend:');
        console.log('');
        console.log('1. Load the JSON file via API call:');
        console.log('   GET /api/projects/demo-project-123/energy-diagram/generate');
        console.log('');
        console.log('2. Execute commands in sequence:');
        console.log('   data.commands.forEach(cmd => diagramEngine.execute(cmd));');
        console.log('');
        console.log('3. Expected diagram structure:');
        console.log('   - Cloud node at top (y=0)');
        console.log('   - On-premise server below cloud (y=8)');
        console.log('   - Energy meters at bottom (y=16)');
        console.log('   - Smart meters connected to both cloud and on-premise');
        console.log('   - Other meters connected only to on-premise');

        // Summary
        console.log('\n🎯 Demo Summary:');
        console.log('=' .repeat(50));
        console.log(`✅ Successfully generated ${result.commands.length} diagram commands`);
        console.log(`✅ Created diagram with ${result.metadata.nodeCount} nodes`);
        console.log(`✅ Supported ${result.metadata.meterTypes.length} different meter types`);
        console.log(`✅ Saved commands to: ${fileResult.filename}`);
        console.log(`✅ Ready for frontend execution`);

        return {
            success: true,
            result,
            fileResult,
            summary: {
                commandCount: result.commands.length,
                nodeCount: result.metadata.nodeCount,
                meterTypes: result.metadata.meterTypes,
                filePath: fileResult.filePath
            }
        };

    } catch (error) {
        console.error('\n❌ Demo failed with error:');
        console.error(error.message);
        console.error('\nStack trace:');
        console.error(error.stack);
        
        return {
            success: false,
            error: error.message
        };
    }
}

// Additional demo functions

async function demonstrateValidation() {
    console.log('\n🔍 Validation Demo:');
    console.log('-'.repeat(30));

    const generator = new EnergyDiagramGenerator();
    
    // Valid data
    const validData = [
        {
            _id: '1',
            label: 'Valid Smart Meter',
            monitoringDeviceType: 'smart-meter',
            panel: 'Panel A'
        }
    ];

    // Invalid data
    const invalidData = [
        {
            _id: '2',
            label: 'Invalid Meter',
            monitoringDeviceType: 'invalid-type', // This will cause validation error
            panel: 'Panel B'
        },
        {
            _id: '3',
            // Missing label and monitoringDeviceType
            panel: 'Panel C'
        }
    ];

    console.log('Valid data test:');
    try {
        const validResult = await generator.generateDiagramCommands(validData);
        console.log(`✅ Valid data processed successfully (${validResult.commands.length} commands)`);
    } catch (error) {
        console.log(`❌ Valid data failed: ${error.message}`);
    }

    console.log('\nInvalid data test:');
    try {
        const invalidResult = await generator.generateDiagramCommands(invalidData);
        console.log(`⚠️ Invalid data processed with warnings (${invalidResult.commands.length} commands)`);
    } catch (error) {
        console.log(`❌ Invalid data failed: ${error.message}`);
    }
}

async function demonstrateCustomData() {
    console.log('\n🎨 Custom Data Demo:');
    console.log('-'.repeat(30));

    const generator = new EnergyDiagramGenerator();
    
    const customData = [
        {
            _id: 'custom-1',
            label: 'Building Main Meter',
            panel: 'Main Electrical Panel',
            monitoringDeviceType: 'smart-meter',
            description: 'Primary building energy meter with IoT capabilities',
            status: 'active'
        },
        {
            _id: 'custom-2',
            label: 'HVAC System Meter',
            panel: 'HVAC Panel',
            monitoringDeviceType: 'general-meter',
            description: 'Dedicated meter for HVAC energy monitoring',
            status: 'active'
        },
        {
            _id: 'custom-3',
            label: 'Backup Power Meter',
            panel: 'Emergency Panel',
            monitoringDeviceType: 'memory-meter',
            description: 'Emergency power system monitoring with data logging',
            status: 'maintenance'
        }
    ];

    const result = await generator.generateDiagramCommands(customData, {
        projectId: 'custom-building-project',
        projectName: 'Smart Building Energy Management'
    });

    console.log(`✅ Custom data processed: ${result.commands.length} commands generated`);
    console.log('Custom meter labels:');
    customData.forEach(meter => {
        console.log(`  - ${meter.label} (${meter.monitoringDeviceType})`);
    });
}

// Main execution
async function main() {
    console.log('🌟 NCCJ Energy Diagram Generator - Complete Demo');
    console.log('='.repeat(60));
    
    // Run main demo
    const mainResult = await runEnergyDiagramDemo();
    
    if (mainResult.success) {
        // Run additional demos
        await demonstrateValidation();
        await demonstrateCustomData();
        
        console.log('\n🎉 All demos completed successfully!');
        console.log('\nNext steps:');
        console.log('1. Start your backend server: npm start');
        console.log('2. Test the API endpoints using the generated commands');
        console.log('3. Integrate with your frontend diagram engine');
        console.log('4. Customize node types and layouts as needed');
    } else {
        console.log('\n💥 Demo failed. Please check the error messages above.');
    }
}

// Run the demo if this file is executed directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    runEnergyDiagramDemo,
    demonstrateValidation,
    demonstrateCustomData
}; 