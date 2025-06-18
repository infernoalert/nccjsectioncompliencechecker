# MCP Conditional Document Processing

## Overview

The MCP system now supports conditional document processing based on page count, separating the handling of regular documents from electrical specifications.

## Processing Logic

### Document Type Determination

- **≤3 pages**: Classified as `regular` document
- **>3 pages**: Classified as `electrical_spec` document

### Processing Methods

#### Regular Documents (≤3 pages)
- **Text Extraction**: Uses both PDF text parsing AND OCR
- **Analysis**: General document analysis with standard prompts
- **Use Case**: Building plans, single-line diagrams, small technical drawings

#### Electrical Specifications (>3 pages)
- **Text Extraction**: Uses PDF text parsing ONLY (no OCR)
- **Analysis**: Specialized electrical specification analysis
- **Use Case**: Detailed electrical specifications, equipment schedules, technical manuals

## Key Changes

### FileProcessor.js
- Added `getPageCount()` method to determine document properties
- Added conditional OCR processing in `extractText()`
- Added document type tracking (`documentType`, `pageCount`)
- Added processing information methods

### LLMAnalyzer.js
- Added document type parameter to `analyzeText()`
- Separate system prompts for different document types
- Specialized analysis for electrical specifications
- Enhanced response parsing with specifications field

### MCPHandler.js
- Updated initialization to determine document type
- Enhanced logging and metadata tracking
- Passes document type information through the pipeline

## Usage

### Basic Usage
```javascript
const fileProcessor = new FileProcessor(filePath, true);

// Get document type
const pageInfo = await fileProcessor.getPageCount();
console.log(`Document Type: ${pageInfo.documentType}`);

// Extract text with conditional processing
const extraction = await fileProcessor.extractText();
console.log(`Processing Method: ${extraction.processingMethod}`);

// Analyze with appropriate prompt
const analysis = await llmAnalyzer.analyzeText(
    extraction.text, 
    extraction.documentType, 
    processingInfo
);
```

### Testing
Run the test script to verify functionality:
```bash
node backend/mcp/test-conditional-processing.js
```

## Benefits

1. **Performance**: Skips OCR for large documents, reducing processing time
2. **Accuracy**: Specialized prompts for electrical specifications
3. **Flexibility**: Automatically adapts processing method based on document type
4. **Maintainability**: Clear separation between document processing logic

## Configuration

The 3-page threshold can be modified in `FileProcessor.js`:
```javascript
this.documentType = this.pageCount > 3 ? 'electrical_spec' : 'regular';
```

## Monitoring

The system logs processing decisions:
- Document type determination
- Processing method selection
- Analysis type used
- Device detection results

Check console logs for detailed processing information. 