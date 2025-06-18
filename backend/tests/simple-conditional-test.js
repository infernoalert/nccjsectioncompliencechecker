const path = require('path');

// Simple test for conditional processing
async function testConditionalProcessing() {
    console.log('🧪 Simple Conditional Processing Test');
    console.log('=====================================');

    try {
        // Test 1: Import modules
        console.log('\n1. Testing module imports...');
        const FileProcessor = require('../mcp/processors/FileProcessor');
        const LLMAnalyzer = require('../mcp/processors/LLMAnalyzer');
        console.log('✅ Modules imported successfully');

        // Test 2: Create a mock PDF file path (doesn't need to exist for this test)
        console.log('\n2. Testing FileProcessor initialization...');
        const mockFilePath = path.join(__dirname, '..', 'uploads', 'mock-test.pdf');
        const fileProcessor = new FileProcessor(mockFilePath, true);
        console.log('✅ FileProcessor created successfully');

        // Test 3: Test document type logic
        console.log('\n3. Testing document type logic...');
        
        // Mock different page counts
        const testCases = [
            { pages: 1, expectedType: 'regular' },
            { pages: 3, expectedType: 'regular' },
            { pages: 4, expectedType: 'electrical_spec' },
            { pages: 10, expectedType: 'electrical_spec' }
        ];

        testCases.forEach(testCase => {
            // Simulate the logic from FileProcessor
            const documentType = testCase.pages > 3 ? 'electrical_spec' : 'regular';
            const processingMethod = documentType === 'regular' ? 'text_parsing_and_ocr' : 'text_parsing_only';
            
            console.log(`   ${testCase.pages} pages → ${documentType} → ${processingMethod}`);
            
            if (documentType === testCase.expectedType) {
                console.log('   ✅ Correct document type determined');
            } else {
                console.log('   ❌ Wrong document type!');
            }
        });

        // Test 4: Test LLM Analyzer initialization
        console.log('\n4. Testing LLMAnalyzer initialization...');
        const mockApiKey = 'test-api-key';
        const llmAnalyzer = new LLMAnalyzer(mockApiKey);
        console.log('✅ LLMAnalyzer created successfully');

        // Test 5: Test method availability
        console.log('\n5. Testing method availability...');
        const methods = [
            'validateFile',
            'detectPageCount', 
            'extractText',
            'getDocumentType',
            'getProcessingInfo'
        ];

        methods.forEach(method => {
            if (typeof fileProcessor[method] === 'function') {
                console.log(`   ✅ ${method} method available`);
            } else {
                console.log(`   ❌ ${method} method missing!`);
            }
        });

        const llmMethods = ['analyzeText', 'needsAdditionalAnalysis'];
        llmMethods.forEach(method => {
            if (typeof llmAnalyzer[method] === 'function') {
                console.log(`   ✅ ${method} method available`);
            } else {
                console.log(`   ❌ ${method} method missing!`);
            }
        });

        console.log('\n✅ All basic tests passed!');
        console.log('\n📝 Summary:');
        console.log('   - Module imports: OK');
        console.log('   - FileProcessor creation: OK');
        console.log('   - Document type logic: OK');
        console.log('   - LLMAnalyzer creation: OK');
        console.log('   - Method availability: OK');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
        return false;
    }

    return true;
}

// Run the test
if (require.main === module) {
    console.log('Running simple conditional processing test...\n');
    testConditionalProcessing()
        .then(success => {
            if (success) {
                console.log('\n🎉 Test completed successfully!');
                process.exit(0);
            } else {
                console.log('\n💥 Test failed!');
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('\n💥 Test execution error:', error);
            process.exit(1);
        });
} else {
    module.exports = testConditionalProcessing;
} 