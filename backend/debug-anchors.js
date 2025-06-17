/**
 * Simple test to debug anchor rules - Shows exact connection commands
 */

const EnergyDiagramGenerator = require('./services/energyDiagramGenerator');
const { customDiagramRules } = require('./config/diagramRules');

// Simple test data - just one smart meter
const simpleTestData = [
    {
        _id: 'test-1',
        label: 'Debug Smart Meter',
        panel: 'Panel A',
        monitoringDeviceType: 'smart-meter',
        description: 'Test smart meter for anchor debugging',
        status: 'active',
        capacity: 3000,
        priority: 'high',
        critical: true
    }
];

async function debugAnchors() {
    console.log('🔍 DEBUGGING ANCHOR RULES');
    console.log('=========================\n');
    
    const generator = new EnergyDiagramGenerator(customDiagramRules);
    generator.debug = true;
    
    const result = await generator.generateDiagramCommands(simpleTestData, {
        projectId: 'debug-test',
        projectName: 'Anchor Debug Test'
    });
    
    console.log('\n📋 ALL GENERATED COMMANDS:');
    console.log('===========================');
    result.commands.forEach((cmd, i) => {
        console.log(`${i + 1}. ${cmd}`);
    });
    
    console.log('\n🔌 CONNECTION COMMANDS ONLY:');
    console.log('=============================');
    const connections = result.commands.filter(cmd => cmd.startsWith('connect'));
    connections.forEach((cmd, i) => {
        const parts = cmd.split(',');
        console.log(`${i + 1}. ${cmd}`);
        if (parts.length >= 6) {
            console.log(`   📍 Source: ${parts[1]}, Target: ${parts[2]}, Type: ${parts[3]}`);
            console.log(`   🔗 Anchors: ${parts[4]} -> ${parts[5]}`);
        }
        console.log('');
    });
    
    return result;
}

// Run if called directly
if (require.main === module) {
    debugAnchors().catch(console.error);
}

module.exports = { debugAnchors }; 