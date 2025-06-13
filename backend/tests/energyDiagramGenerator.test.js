const EnergyDiagramGenerator = require('../services/energyDiagramGenerator');
const fs = require('fs').promises;
const path = require('path');

describe('EnergyDiagramGenerator', () => {
    let generator;

    beforeEach(() => {
        generator = new EnergyDiagramGenerator();
    });

    describe('generateDiagramCommands', () => {
        test('should generate commands for sample data', async () => {
            const sampleData = generator.generateSampleData();
            const result = await generator.generateDiagramCommands(sampleData, {
                projectId: 'test-project',
                projectName: 'Test Project'
            });

            expect(result).toHaveProperty('commands');
            expect(result).toHaveProperty('metadata');
            expect(result).toHaveProperty('nodePositions');
            expect(result).toHaveProperty('nodeIds');

            expect(Array.isArray(result.commands)).toBe(true);
            expect(result.commands.length).toBeGreaterThan(0);

            // Check that infrastructure nodes are created
            expect(result.commands.some(cmd => cmd.includes('add,cloud'))).toBe(true);
            expect(result.commands.some(cmd => cmd.includes('add,onpremise'))).toBe(true);

            // Check that meter nodes are created
            expect(result.commands.some(cmd => cmd.includes('add,smart-meter'))).toBe(true);
            expect(result.commands.some(cmd => cmd.includes('add,general-meter'))).toBe(true);
            expect(result.commands.some(cmd => cmd.includes('add,memory-meter'))).toBe(true);

            // Check that connections are created
            expect(result.commands.some(cmd => cmd.includes('connect,'))).toBe(true);

            // Check that styling is applied
            expect(result.commands.some(cmd => cmd.includes('style,'))).toBe(true);

            // Check that layout is applied
            expect(result.commands.some(cmd => cmd.includes('layout,hierarchical'))).toBe(true);
        });

        test('should handle empty data gracefully', async () => {
            const result = await generator.generateDiagramCommands([], {
                projectId: 'empty-project',
                projectName: 'Empty Project'
            });

            expect(result.commands).toContain('add,cloud,4,0');
            expect(result.commands).toContain('add,onpremise,4,8');
            expect(result.metadata.nodeCount).toBe(2); // Only cloud and onpremise
        });

        test('should generate correct metadata', async () => {
            const sampleData = generator.generateSampleData();
            const result = await generator.generateDiagramCommands(sampleData, {
                projectId: 'test-project',
                projectName: 'Test Project'
            });

            expect(result.metadata).toMatchObject({
                version: '1.0',
                diagramType: 'energy-monitoring',
                nodeCount: 5, // 3 meters + cloud + onpremise
                projectId: 'test-project',
                projectName: 'Test Project',
                generator: 'EnergyDiagramGenerator'
            });

            expect(result.metadata.meterTypes).toEqual(['smart-meter', 'general-meter', 'memory-meter']);
            expect(result.metadata.generatedAt).toBeDefined();
        });
    });

    describe('saveCommandsToFile', () => {
        test('should save commands to JSON file', async () => {
            const sampleData = generator.generateSampleData();
            const result = await generator.generateDiagramCommands(sampleData);
            
            const fileResult = await generator.saveCommandsToFile(
                result.commands,
                result.metadata,
                'test-project'
            );

            expect(fileResult).toHaveProperty('filePath');
            expect(fileResult).toHaveProperty('filename');
            expect(fileResult).toHaveProperty('diagramData');

            // Check if file exists
            const fileExists = await fs.access(fileResult.filePath).then(() => true).catch(() => false);
            expect(fileExists).toBe(true);

            // Read and verify file content
            const fileContent = await fs.readFile(fileResult.filePath, 'utf8');
            const parsedContent = JSON.parse(fileContent);

            expect(parsedContent).toHaveProperty('commands');
            expect(parsedContent).toHaveProperty('metadata');
            expect(parsedContent).toHaveProperty('executionInstructions');

            // Clean up test file
            await fs.unlink(fileResult.filePath).catch(() => {});
        });
    });

    describe('generateSampleData', () => {
        test('should generate valid sample data', () => {
            const sampleData = generator.generateSampleData();

            expect(Array.isArray(sampleData)).toBe(true);
            expect(sampleData.length).toBe(3);

            sampleData.forEach(meter => {
                expect(meter).toHaveProperty('_id');
                expect(meter).toHaveProperty('label');
                expect(meter).toHaveProperty('panel');
                expect(meter).toHaveProperty('monitoringDeviceType');
                expect(meter).toHaveProperty('description');
                expect(meter).toHaveProperty('connection');
                expect(meter).toHaveProperty('status');
            });
        });
    });
});

// Manual test function for demonstration
async function runManualTest() {
    console.log('🚀 Running Energy Diagram Generator Manual Test\n');

    const generator = new EnergyDiagramGenerator();
    
    try {
        // Generate sample data
        console.log('📊 Generating sample energy monitoring data...');
        const sampleData = generator.generateSampleData();
        console.log('Sample data:', JSON.stringify(sampleData, null, 2));

        // Generate diagram commands
        console.log('\n🔧 Generating diagram commands...');
        const result = await generator.generateDiagramCommands(sampleData, {
            projectId: 'demo-project',
            projectName: 'Demo Energy Monitoring Project'
        });

        console.log('\n📋 Generated Commands:');
        result.commands.forEach((command, index) => {
            console.log(`${index + 1}. ${command}`);
        });

        console.log('\n📈 Metadata:');
        console.log(JSON.stringify(result.metadata, null, 2));

        // Save to file
        console.log('\n💾 Saving to file...');
        const fileResult = await generator.saveCommandsToFile(
            result.commands,
            result.metadata,
            'demo-project'
        );

        console.log(`✅ File saved: ${fileResult.filename}`);
        console.log(`📁 Full path: ${fileResult.filePath}`);

        console.log('\n🎯 Test completed successfully!');
        
        return {
            success: true,
            result,
            fileResult
        };

    } catch (error) {
        console.error('❌ Test failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Export for use in other tests
module.exports = {
    runManualTest
};

// Run manual test if this file is executed directly
if (require.main === module) {
    runManualTest();
} 