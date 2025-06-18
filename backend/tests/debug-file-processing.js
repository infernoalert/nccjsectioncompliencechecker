const fs = require('fs').promises;
const path = require('path');

// Debug script to check file processing issues
async function debugFileProcessing() {
    console.log('🔧 Debug File Processing Test');
    console.log('==============================');

    try {
        // Test 1: Check if the file exists and can be accessed
        const testFilePath = path.join(__dirname, '..', 'uploads', '1750214576140-155990004.pdf');
        console.log(`\n1. Testing file access:`);
        console.log(`   File path: ${testFilePath}`);
        
        try {
            await fs.access(testFilePath);
            console.log('   ✅ File exists and is accessible');
            
            const stats = await fs.stat(testFilePath);
            console.log(`   📏 File size: ${stats.size} bytes`);
            console.log(`   📅 Modified: ${stats.mtime}`);
        } catch (accessError) {
            console.log('   ❌ File access failed:', accessError.message);
            
            // Try to list files in uploads directory
            try {
                const uploadsDir = path.join(__dirname, '..', 'uploads');
                const files = await fs.readdir(uploadsDir);
                console.log(`   📁 Files in uploads directory:`, files);
            } catch (dirError) {
                console.log('   ❌ Cannot read uploads directory:', dirError.message);
            }
            return;
        }

        // Test 2: Try to read the file
        console.log(`\n2. Testing file reading:`);
        try {
            const dataBuffer = await fs.readFile(testFilePath);
            console.log(`   ✅ File read successfully`);
            console.log(`   📊 Buffer size: ${dataBuffer.length} bytes`);
            
            // Check if it looks like a PDF
            const header = dataBuffer.slice(0, 4).toString();
            console.log(`   📄 File header: ${header}`);
            if (header === '%PDF') {
                console.log('   ✅ Valid PDF file header detected');
            } else {
                console.log('   ⚠️  Unexpected file header - may not be a valid PDF');
            }
        } catch (readError) {
            console.log('   ❌ File reading failed:', readError.message);
            return;
        }

        // Test 3: Try to import and use the FileProcessor
        console.log(`\n3. Testing FileProcessor import and usage:`);
        try {
            const FileProcessor = require('../mcp/processors/FileProcessor');
            console.log('   ✅ FileProcessor imported successfully');
            
            const fileProcessor = new FileProcessor(testFilePath, true);
            console.log('   ✅ FileProcessor instance created');
            
            // Test validation
            const validation = await fileProcessor.validateFile();
            if (validation.success) {
                console.log('   ✅ File validation passed');
            } else {
                console.log('   ❌ File validation failed:', validation.error);
                return;
            }
            
            // Test page count detection
            const pageResult = await fileProcessor.detectPageCount();
            if (pageResult.success) {
                console.log(`   ✅ Page count detection successful:`);
                console.log(`      Pages: ${pageResult.pageCount}`);
                console.log(`      Document Type: ${pageResult.documentType}`);
            } else {
                console.log('   ❌ Page count detection failed:', pageResult.error);
            }
            
        } catch (importError) {
            console.log('   ❌ FileProcessor import/usage failed:', importError.message);
            console.log('   Stack:', importError.stack);
        }

        console.log('\n✅ Debug test completed');
        
    } catch (error) {
        console.error('\n💥 Debug test failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Run the debug test
if (require.main === module) {
    debugFileProcessing()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('Debug execution failed:', error);
            process.exit(1);
        });
}

module.exports = debugFileProcessing; 