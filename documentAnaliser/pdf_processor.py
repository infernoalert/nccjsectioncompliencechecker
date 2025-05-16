from openai import OpenAI
from typing import Dict, Any, List, Generator
import os
import PyPDF2
from config import settings

class PDFProcessor:
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL

    def process_document(self, file_path: str) -> Generator[Dict[str, Any], None, None]:
        """Process a PDF document section by section using OpenAI."""
        # Extract text from PDF
        sections = self._extract_sections_from_pdf(file_path)
        
        # Process each section individually
        for section_id, section_text in sections:
            yield self._process_section(section_id, section_text)

    def _extract_sections_from_pdf(self, file_path: str) -> Generator[tuple[str, str], None, None]:
        """Extract sections from PDF file."""
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            
            # First, get the table of contents or section markers
            section_markers = self._identify_section_markers(pdf_reader)
            
            # Then extract each section
            for i, page in enumerate(pdf_reader.pages):
                text = page.extract_text()
                sections = self._split_into_sections(text, section_markers)
                for section_id, section_text in sections:
                    yield section_id, section_text

    def _identify_section_markers(self, pdf_reader: PyPDF2.PdfReader) -> List[str]:
        """Identify section markers in the document."""
        # Get the first few pages to identify section patterns
        sample_text = ""
        for i in range(min(3, len(pdf_reader.pages))):
            sample_text += pdf_reader.pages[i].extract_text()

        # Use OpenAI to identify section patterns
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "Analyze the following text and identify patterns that mark the beginning of sections (like 'Section 1:', 'Chapter 2:', etc.). Return only the patterns as a JSON array."},
                {"role": "user", "content": sample_text}
            ],
            response_format={ "type": "json_object" }
        )
        
        try:
            patterns = eval(response.choices[0].message.content)
            return patterns if isinstance(patterns, list) else []
        except:
            return []

    def _split_into_sections(self, text: str, section_markers: List[str]) -> Generator[tuple[str, str], None, None]:
        """Split text into sections based on markers."""
        lines = text.split('\n')
        current_section = []
        current_section_id = None

        for line in lines:
            # Check if line contains a section marker
            section_id = self._extract_section_id(line, section_markers)
            
            if section_id:
                # Yield previous section if exists
                if current_section_id and current_section:
                    yield current_section_id, '\n'.join(current_section)
                # Start new section
                current_section_id = section_id
                current_section = [line]
            elif current_section_id:
                current_section.append(line)

        # Yield the last section
        if current_section_id and current_section:
            yield current_section_id, '\n'.join(current_section)

    def _extract_section_id(self, line: str, section_markers: List[str]) -> str:
        """Extract section ID from a line if it matches any section marker."""
        for marker in section_markers:
            if marker in line:
                # Extract the section identifier (e.g., "j9D3" from "Section j9D3:")
                parts = line.split(marker)
                if len(parts) > 1:
                    # Clean up the section ID
                    section_id = parts[1].strip().split()[0]
                    return section_id
        return ""

    def _process_section(self, section_id: str, section_text: str) -> Dict[str, Any]:
        """Process a single section using OpenAI."""
        # First, analyze the section structure
        structure_response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": """Analyze the following section and identify its structure.
                Return a JSON object with:
                - title: The section title
                - contentBlocks: Array of content blocks, each with:
                  - contentType: 'list', 'table', 'button', or 'text'
                  - title: Block title
                  - content: The actual content
                - overallApplicability: Any building classes or other applicability rules
                """},
                {"role": "user", "content": f"Section ID: {section_id}\n\n{section_text}"}
            ],
            response_format={ "type": "json_object" }
        )

        try:
            structure = eval(structure_response.choices[0].message.content)
            
            # Process each content block
            processed_blocks = []
            for block in structure.get("contentBlocks", []):
                content_type = block.get("contentType", "text")
                processed_block = self._process_content_block(content_type, block)
                if processed_block:
                    processed_blocks.append(processed_block)

            return {
                "sectionId": section_id,
                "title": structure.get("title", f"Section {section_id}"),
                "overallApplicability": structure.get("overallApplicability", {
                    "buildingClasses": ["Class_X"],
                    "climateZones": None,
                    "minFloorArea": None,
                    "maxFloorArea": None
                }),
                "contentBlocks": processed_blocks
            }
        except Exception as e:
            return {
                "sectionId": section_id,
                "title": f"Section {section_id}",
                "contentBlocks": [{
                    "contentType": "text",
                    "title": "Error",
                    "content": f"Failed to process section: {str(e)}"
                }]
            }

    def _process_content_block(self, content_type: str, block: Dict[str, Any]) -> Dict[str, Any]:
        """Process a specific content block based on its type."""
        if content_type == "list":
            return self._process_list_block(block)
        elif content_type == "table":
            return self._process_table_block(block)
        elif content_type == "button":
            return self._process_button_block(block)
        else:
            return self._process_text_block(block)

    def _process_list_block(self, block: Dict[str, Any]) -> Dict[str, Any]:
        """Process a list content block."""
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "Extract list items from the following text. Return a JSON object with 'listType' and 'items' array."},
                {"role": "user", "content": block.get("content", "")}
            ],
            response_format={ "type": "json_object" }
        )
        
        try:
            list_data = eval(response.choices[0].message.content)
            return {
                "contentType": "list",
                "title": block.get("title", ""),
                "listType": list_data.get("listType", "unordered"),
                "items": list_data.get("items", [])
            }
        except:
            return {
                "contentType": "list",
                "title": block.get("title", ""),
                "listType": "unordered",
                "items": []
            }

    def _process_table_block(self, block: Dict[str, Any]) -> Dict[str, Any]:
        """Process a table content block."""
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "Extract table data from the following text. Return a JSON object with 'headers' array and 'rows' array of arrays."},
                {"role": "user", "content": block.get("content", "")}
            ],
            response_format={ "type": "json_object" }
        )
        
        try:
            table_data = eval(response.choices[0].message.content)
            return {
                "contentType": "table",
                "title": block.get("title", ""),
                "headers": table_data.get("headers", []),
                "rows": table_data.get("rows", [])
            }
        except:
            return {
                "contentType": "table",
                "title": block.get("title", ""),
                "headers": [],
                "rows": []
            }

    def _process_button_block(self, block: Dict[str, Any]) -> Dict[str, Any]:
        """Process a button content block."""
        return {
            "contentType": "button",
            "title": block.get("title", ""),
            "text": block.get("content", ""),
            "link": block.get("link", "")
        }

    def _process_text_block(self, block: Dict[str, Any]) -> Dict[str, Any]:
        """Process a text content block."""
        return {
            "contentType": "text",
            "title": block.get("title", ""),
            "content": block.get("content", "")
        }

    def extract_section(self, document: Dict[str, Any], section_id: str) -> Dict[str, Any]:
        """Extract a specific section from the document."""
        if isinstance(document, str):
            import json
            document = json.loads(document)

        return document.get("content", {})

    def _process_with_openai(self, text_content: str) -> Dict[str, Any]:
        """Process text content using OpenAI API."""
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "You are a document analysis assistant. Analyze the following text and identify its structure, including sections, tables, and lists."},
                {"role": "user", "content": text_content}
            ],
            response_format={ "type": "json_object" }
        )
        return response.choices[0].message.content

    def _analyze_content(self, section: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze the content type and structure of a section."""
        content_type = section.get("type", "text")
        
        result = {
            "type": content_type,
            "text": section.get("text", ""),
            "confidence": section.get("confidence", 1.0),
            "metadata": section.get("metadata", {})
        }

        if content_type == "table":
            result["table_data"] = section.get("table_data", [])
        elif content_type == "list":
            result["list_items"] = section.get("list_items", [])

        return result

    def _determine_content_type(self, text: str) -> str:
        """Determine the type of content using OpenAI."""
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "Determine if the following text is a table, list, or regular text. Respond with just one word: 'table', 'list', or 'text'."},
                {"role": "user", "content": text}
            ],
            max_tokens=10
        )
        return response.choices[0].message.content.strip().lower() 