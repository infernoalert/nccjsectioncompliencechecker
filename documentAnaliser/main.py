import os
from pdf_processor import PDFProcessor
from json_generator import JSONGenerator
from typing import List
import argparse

def process_document(pdf_path: str, section_ids: List[str]) -> List[str]:
    """Process a PDF document and extract specified sections."""
    processor = PDFProcessor()
    json_gen = JSONGenerator()
    
    # Get document name without extension
    document_name = os.path.splitext(os.path.basename(pdf_path))[0]
    
    # Process each section as it's found
    json_files = []
    for section_data in processor.process_document(pdf_path):
        section_id = section_data.get("section_id")
        
        # Only process requested sections
        if section_id in section_ids:
            # Generate JSON for the section
            json_path = json_gen.generate_json(
                data=section_data.get("content", {}),
                section_id=section_id,
                document_name=document_name
            )
            json_files.append(json_path)
            print(f"Generated JSON for section {section_id}: {json_path}")
            
            # Remove processed section from the list
            section_ids.remove(section_id)
    
    # Report any sections that weren't found
    for section_id in section_ids:
        print(f"Section {section_id} not found in the document")
    
    # Merge all JSON files if there are multiple sections
    if len(json_files) > 1:
        merged_path = json_gen.merge_json_files(
            json_files=json_files,
            output_filename=f"{document_name}_merged.json"
        )
        print(f"Merged JSON file created: {merged_path}")
    
    return json_files

def main():
    parser = argparse.ArgumentParser(description="Process PDF documents and extract sections")
    parser.add_argument("pdf_path", help="Path to the PDF file")
    parser.add_argument("--sections", nargs="+", help="List of section IDs to extract")
    
    args = parser.parse_args()
    
    if not os.path.exists(args.pdf_path):
        print(f"Error: PDF file not found at {args.pdf_path}")
        return
    
    if not args.sections:
        print("Error: No section IDs provided")
        return
    
    process_document(args.pdf_path, args.sections)

if __name__ == "__main__":
    main() 