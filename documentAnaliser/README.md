# PDF Document Analyzer

This application uses OpenAI's GPT models to analyze PDF documents and extract specific sections into structured JSON files.

## Setup

1. Install the required dependencies:
```bash
pip install -r requirements.txt
```

2. Set up OpenAI credentials:
   - Create an OpenAI account
   - Generate an API key from the OpenAI dashboard
   - Create a `.env` file in the project root with the following variables:
```
OPENAI_API_KEY=your-api-key
OPENAI_MODEL=gpt-4-turbo-preview  # or your preferred model
OUTPUT_DIR=output
```

## Usage

Run the application with a PDF file and section IDs:

```bash
python main.py path/to/your/document.pdf --sections j9D3 j9D4 j9D5
```

The application will:
1. Extract text from the PDF using PyPDF2
2. Process the text using OpenAI's GPT model
3. Extract the specified sections
4. Generate individual JSON files for each section
5. Create a merged JSON file containing all sections

## Output

The application generates JSON files in the following format:

```json
{
  "metadata": {
    "document_name": "example",
    "section_id": "j9D3",
    "timestamp": "20240321_123456",
    "version": "1.0"
  },
  "content": {
    "type": "text|table|list",
    "text": "section content",
    "confidence": 0.95,
    "metadata": {
      // Additional metadata about the section
    },
    // Additional fields based on content type
  }
}
```

## Features

- Modular design for easy extension
- Support for different content types (text, tables, lists)
- Intelligent content type detection using GPT
- JSON file generation with metadata
- Ability to merge multiple section JSON files
- Configurable output directory
- Uses OpenAI's GPT model for intelligent document analysis
- PyPDF2 for reliable PDF text extraction 