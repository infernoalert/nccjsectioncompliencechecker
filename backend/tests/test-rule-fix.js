const EnergyDiagramGenerator = require('../services/energyDiagramGenerator');

async function testRuleFix() {
    console.log('🧪 Testing Rule Engine Label Preservation Fix');
    
    const generator = new EnergyDiagramGenerator();

    // Test with sample data that has specific labels
    const testData = [
        {
            _id: '1',
            label: 'TEST-METER-1',
            monitoringDeviceType: 'smart-meter',
            capacity: 1000,
            panel: 'Panel A'
        },
        {
            _id: '2', 
            label: 'TEST-METER-2',
            monitoringDeviceType: 'smart-meter',
            capacity: 3000,
            panel: 'Panel B'
        }
    ];

    const projectData = { projectId: 'test', projectName: 'Test Project' };

    try {
        const result = await generator.generateDiagramCommands(testData, projectData);
        
        console.log('\n=== Generated Commands ===');
        let labelCommands = 0;
        result.commands.forEach((cmd, index) => {
            if (cmd.includes(',label,')) {
                console.log(`Command ${index + 1}: ${cmd}`);
                labelCommands++;
            }
        });
        
        console.log(`\n📊 Found ${labelCommands} label commands`);
        
        // Check if our test labels are preserved
        const hasTestMeter1 = result.commands.some(cmd => cmd.includes('TEST-METER-1'));
        const hasTestMeter2 = result.commands.some(cmd => cmd.includes('TEST-METER-2'));
        
        console.log(`\n✅ TEST-METER-1 preserved: ${hasTestMeter1}`);
        console.log(`✅ TEST-METER-2 preserved: ${hasTestMeter2}`);
        
        if (hasTestMeter1 && hasTestMeter2) {
            console.log('\n🎉 SUCCESS: Rule engine is preserving device labels correctly!');
        } else {
            console.log('\n❌ ISSUE: Device labels are still being overwritten');
        }
        
    } catch (err) {
        console.error('❌ Error:', err);
    }
}

testRuleFix(); 