/**
 * Test Script for Custom DiagramRuleEngine Rules
 * 
 * This script demonstrates how to test your custom rules.
 * Run with: node backend/test-my-custom-rules.js
 */

const EnergyDiagramGenerator = require('./services/energyDiagramGenerator');
const { customDiagramRules } = require('./config/diagramRules');

// Sample test data
const testEnergyData = [
    {
        _id: '1',
        label: 'Test Smart Meter',
        panel: 'Panel A',
        monitoringDeviceType: 'smart-meter',
        description: 'Test device for rule testing',
        status: 'active',
        capacity: 3000,
        priority: 'high',
        critical: true,
        location: 'building-a',
        // Add your custom properties here for testing
        myCustomProperty: true,
        deviceType: 'special-device'
    },
    {
        _id: '2',
        label: 'Test General Meter',
        panel: 'Panel B',
        monitoringDeviceType: 'general-meter',
        description: 'Another test device',
        status: 'warning',
        capacity: 1500,
        priority: 'normal',
        critical: false,
        location: 'building-b'
    }
];

/**
 * Test custom rules with the sample data
 */
async function testCustomRules() {
    console.log('\n🧪 Testing Custom DiagramRuleEngine Rules\n');
    console.log('==========================================');
    
    try {
        // Initialize generator with custom rules
        const generator = new EnergyDiagramGenerator(customDiagramRules);
        generator.debug = true; // Enable debug logging
        
        console.log('\n📊 Rule Statistics:');
        console.log(generator.getRuleStats());
        
        console.log('\n🔄 Generating diagram with custom rules...\n');
        
        // Generate diagram commands
        const result = await generator.generateDiagramCommands(testEnergyData, {
            projectId: 'test-custom-rules',
            projectName: 'Custom Rules Test Project'
        });
        
        console.log('\n✅ Generation Complete!');
        console.log('==========================================');
        console.log(`Generated ${result.commands.length} commands`);
        console.log('\n📋 Commands Preview:');
        result.commands.slice(0, 10).forEach((cmd, i) => {
            console.log(`${i + 1}. ${cmd}`);
        });
        
        if (result.commands.length > 10) {
            console.log(`... and ${result.commands.length - 10} more commands`);
        }
        
        console.log('\n🔍 Connection Analysis:');
        const connectionCommands = result.commands.filter(cmd => cmd.startsWith('connect'));
        const cloudConnections = connectionCommands.filter(cmd => cmd.includes(',cloud,'));
        
        console.log(`Total connections: ${connectionCommands.length}`);
        console.log(`Direct cloud connections: ${cloudConnections.length}`);
        
        if (cloudConnections.length > 0) {
            console.log('⚠️  Found direct cloud connections:');
            cloudConnections.forEach(conn => console.log(`   ${conn}`));
        } else {
            console.log('✅ No direct cloud connections found - rule working!');
        }
        
        console.log('\n📊 Metadata:');
        console.log(JSON.stringify(result.metadata, null, 2));
        
        console.log('\n🎯 To see your custom rules in action:');
        console.log('1. Add your rules to backend/config/diagramRules.js');
        console.log('2. Modify the test data above to match your rule conditions');
        console.log('3. Run this script again to see the results');
        
    } catch (error) {
        console.error('❌ Error testing custom rules:', error);
        console.error('\n🔍 Debug Tips:');
        console.error('- Check your rule syntax in diagramRules.js');
        console.error('- Ensure all rule properties are defined');
        console.error('- Verify condition and action functions are valid');
    }
}

/**
 * Test adding rules dynamically
 */
async function testDynamicRules() {
    console.log('\n🚀 Testing Dynamic Rule Addition\n');
    console.log('==========================================');
    
    const generator = new EnergyDiagramGenerator();
    generator.debug = true;
    
    // Add a rule dynamically
    console.log('➕ Adding custom rule dynamically...');
    generator.addRule('stylingRules', {
        name: 'dynamic-test-rule',
        description: 'A rule added dynamically for testing',
        condition: (node, context) => node.label.includes('Test'),
        action: (node, context) => ({
            color: '#9C27B0',
            borderWidth: 5,
            dynamicRuleApplied: true
        }),
        priority: 95
    });
    
    console.log('✅ Dynamic rule added!');
    
    const result = await generator.generateDiagramCommands(testEnergyData, {
        projectId: 'test-dynamic-rules',
        projectName: 'Dynamic Rules Test'
    });
    
    console.log(`\n📋 Generated ${result.commands.length} commands with dynamic rule`);
}

/**
 * Main test runner
 */
async function runTests() {
    console.log('🎯 DiagramRuleEngine Custom Rules Test');
    console.log('=====================================');
    
    await testCustomRules();
    await testDynamicRules();
    
    console.log('\n🎉 All tests completed!');
    console.log('\n📚 Next Steps:');
    console.log('- Edit backend/config/diagramRules.js to add your rules');
    console.log('- Modify test data in this file to match your conditions');
    console.log('- Run your diagram generation API to see rules in production');
}

// Run the tests
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = {
    testCustomRules,
    testDynamicRules,
    testEnergyData
}; 