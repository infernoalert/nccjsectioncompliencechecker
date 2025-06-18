const FileProcessor = require('../mcp/processors/FileProcessor');
const LLMAnalyzer = require('../mcp/processors/LLMAnalyzer');
const path = require('path');

/**
 * Test script for conditional document processing
 * Tests the new logic for handling documents based on page count
 */
async function testConditionalProcessing() {
    console.log('='.repeat(60));
    console.log('🧪 TESTING CONDITIONAL DOCUMENT PROCESSING');
    console.log('='.repeat(60));

    // Test with a sample PDF file (replace with actual file path)
    const testFilePath = path.join(__dirname, '..', 'uploads', 'test-document.pdf');
    
    try {
        console.log('\n📄 Initializing FileProcessor...');
        const fileProcessor = new FileProcessor(testFilePath, true);
        
        // Step 1: Validate file
        console.log('\n✅ Validating file...');
        const validation = await fileProcessor.validateFile();
        if (!validation.success) {
            throw new Error(`File validation failed: ${validation.error}`);
        }
        console.log('✅ File validation passed');

        // Step 2: Get page count and document type
        console.log('\n📊 Getting page count and document type...');
        const pageInfo = await fileProcessor.getPageCount();
        if (!pageInfo.success) {
            throw new Error(`Page count failed: ${pageInfo.error}`);
        }
        
        console.log(`📋 Pages: ${pageInfo.pageCount}`);
        console.log(`📝 Document Type: ${pageInfo.documentType}`);
        console.log(`🔧 Processing Method: ${pageInfo.pageCount <= 3 ? 'text_parsing_and_ocr' : 'text_parsing_only'}`);

        // Step 3: Extract text with conditional processing
        console.log('\n📄 Extracting text...');
        const extraction = await fileProcessor.extractText();
        if (!extraction.success) {
            throw new Error(`Text extraction failed: ${extraction.error}`);
        }
        
        console.log(`✅ Text extraction completed using: ${extraction.processingMethod}`);
        console.log(`📊 Text length: ${extraction.text.length} characters`);

        // Step 4: Test LLM Analysis
        console.log('\n🧠 Testing LLM Analysis...');
        const openaiApiKey = process.env.OPENAI_API_KEY;
        if (!openaiApiKey) {
            console.log('⚠️  OPENAI_API_KEY not found, skipping LLM analysis test');
            return;
        }

        const llmAnalyzer = new LLMAnalyzer(openaiApiKey);
        const processingInfo = fileProcessor.getProcessingInfo();
        
        console.log('🚀 Analyzing with LLM...');
        const analysis = await llmAnalyzer.analyzeText(
            extraction.text,
            extraction.documentType,
            processingInfo
        );

        if (analysis.success) {
            console.log('✅ LLM Analysis completed successfully');
            console.log(`📊 Document Type: ${analysis.documentType}`);
            console.log(`🔍 Analysis Type: ${analysis.results.analysisType}`);
            console.log(`📱 Devices Found: ${analysis.results.energyMonitoringDevices.length}`);
            
            if (analysis.results.energyMonitoringDevices.length > 0) {
                console.log('\n📋 Found Devices:');
                analysis.results.energyMonitoringDevices.forEach((device, index) => {
                    console.log(`  ${index + 1}. ${device.label} - ${device.type}`);
                    if (device.specifications && extraction.documentType === 'electrical_spec') {
                        console.log(`     Specs: ${device.specifications}`);
                    }
                });
            }
        } else {
            console.log(`❌ LLM Analysis failed: ${analysis.error}`);
        }

        console.log('\n✅ Test completed successfully!');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error('Stack trace:', error.stack);
    }
    
    console.log('\n' + '='.repeat(60));
}

// Run the test if this file is executed directly
if (require.main === module) {
    testConditionalProcessing()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('Test execution failed:', error);
            process.exit(1);
        });
}

module.exports = testConditionalProcessing; 