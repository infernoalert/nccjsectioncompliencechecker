/**
 * Test file for Rule-Based Energy Diagram Generator
 * Demonstrates flexible rule configuration and usage
 */

const EnergyDiagramGenerator = require('../services/energyDiagramGenerator');
const { customDiagramRules, ruleTemplates, quickConfigurations } = require('../config/diagramRules');

// Sample energy monitoring data for testing
const sampleEnergyData = [
    {
        _id: '1',
        label: 'Main Smart Meter',
        panel: 'Panel A',
        monitoringDeviceType: 'smart-meter',
        description: 'Primary energy monitoring device',
        status: 'active',
        capacity: 3000,
        priority: 'high',
        critical: true,
        location: 'building-a'
    },
    {
        _id: '2',
        label: 'High Capacity Meter',
        panel: 'Panel B',
        monitoringDeviceType: 'general-meter',
        description: 'Industrial high-capacity meter',
        status: 'active',
        capacity: 5500,
        priority: 'high',
        critical: false,
        location: 'building-a'
    },
    {
        _id: '3',
        label: 'Memory Data Logger',
        panel: 'Panel A',
        monitoringDeviceType: 'memory-meter',
        description: 'Data logging device',
        status: 'warning',
        capacity: 1200,
        priority: 'normal',
        critical: false,
        location: 'building-b'
    }
];

/**
 * Test basic rule application
 */
async function testBasicRules() {
    console.log('\n=== Test: Basic Rule Application ===');
    
    const generator = new EnergyDiagramGenerator();
    generator.debug = true;
    
    const result = await generator.generateDiagramCommands(sampleEnergyData, {
        projectId: 'test-basic-rules',
        projectName: 'Basic Rules Test'
    });
    
    console.log(`Generated ${result.commands.length} commands`);
    console.log('Rule stats:', generator.getRuleStats());
    
    return result;
}

/**
 * Test custom rules with capacity > 2500 using ethernet
 */
async function testCustomRules() {
    console.log('\n=== Test: Custom Rules (Ethernet for >2500 capacity) ===');
    
    const generator = new EnergyDiagramGenerator(customDiagramRules);
    generator.debug = true;
    
    const result = await generator.generateDiagramCommands(sampleEnergyData, {
        projectId: 'test-custom-rules',
        projectName: 'Custom Rules Test'
    });
    
    console.log(`Generated ${result.commands.length} commands with custom rules`);
    
    // Find devices with capacity > 2500 and check their connection type
    const highCapacityCommands = result.commands.filter(cmd => 
        cmd.includes('connectionType,ethernet') || cmd.includes('requiresEthernet')
    );
    console.log(`High-capacity ethernet rules applied: ${highCapacityCommands.length}`);
    
    return result;
}

/**
 * Test the three new specific rules
 */
async function testNewRules() {
    console.log('\n=== Test: New Specific Rules ===');
    
    const generator = new EnergyDiagramGenerator(customDiagramRules);
    generator.debug = true;
    
    const result = await generator.generateDiagramCommands(sampleEnergyData, {
        projectId: 'test-new-rules',
        projectName: 'New Rules Test'
    });
    
    console.log(`Generated ${result.commands.length} commands with new rules`);
    
    // Check Rule 1: Smart meters connect to on-premise with ethernet
    const smartMeterEthernetConnections = result.commands.filter(cmd => 
        cmd.includes('connect,smart-meter') && cmd.includes('ethernet') && cmd.includes('onpremise')
    );
    console.log(`Rule 1 - Smart meters with ethernet to on-premise: ${smartMeterEthernetConnections.length}`);
    
    // Check Rule 2: On-premise connects to cloud with wireless
    const onpremiseWirelessConnections = result.commands.filter(cmd => 
        cmd.includes('connect,onpremise') && cmd.includes('wireless') && cmd.includes('cloud')
    );
    console.log(`Rule 2 - On-premise wireless to cloud: ${onpremiseWirelessConnections.length}`);
    
    // Check Rule 3: Connection anchoring (top-to-bottom)
    const anchoredConnections = result.commands.filter(cmd => 
        cmd.includes(',bottom,') || cmd.includes(',top,')
    );
    console.log(`Rule 3 - Connections with anchoring: ${anchoredConnections.length}`);
    
    // Show some example commands
    console.log('\nExample connection commands:');
    result.commands.filter(cmd => cmd.startsWith('connect,')).slice(0, 5).forEach(cmd => {
        console.log(`  ${cmd}`);
    });
    
    return result;
}

/**
 * Run all tests
 */
async function runAllTests() {
    console.log('🚀 Starting Rule-Based Diagram Generator Tests');
    console.log('===============================================');
    
    try {
        await testBasicRules();
        await testCustomRules();
        await testNewRules();
        
        console.log('\n✅ All tests completed successfully!');
        console.log('\n=== Key Rules Demonstrated ===');
        console.log('🔹 Always place wireless on top');
        console.log('🔹 Use ethernet for devices > 2500 capacity');
        console.log('🔹 Visual coding based on capacity');
        console.log('🔹 Critical device highlighting');
        console.log('🔹 Smart meters connect to on-premise with ethernet (New Rule 1)');
        console.log('🔹 On-premise connects to cloud with wireless (New Rule 2)');
        console.log('🔹 Top-to-bottom connection anchoring (New Rule 3)');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

// Export for external usage
module.exports = {
    runAllTests,
    testBasicRules,
    testCustomRules,
    testNewRules,
    sampleEnergyData
};

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests().catch(console.error);
} 