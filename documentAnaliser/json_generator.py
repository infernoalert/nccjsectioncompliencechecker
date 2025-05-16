import json
import os
from typing import Dict, Any, List
from datetime import datetime
from config import settings

class JSONGenerator:
    def __init__(self):
        self.output_dir = settings.OUTPUT_DIR
        os.makedirs(self.output_dir, exist_ok=True)
        self.template = self._load_template()

    def _load_template(self) -> Dict[str, Any]:
        """Load the JSON template."""
        template_path = os.path.join(os.path.dirname(__file__), 'template.json')
        with open(template_path, 'r', encoding='utf-8') as f:
            return json.load(f)

    def _create_content_block(self, content_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a content block based on the content type."""
        block = {
            "blockId": f"block_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "contentType": content_type,
            "title": data.get("title", ""),
            "blockApplicability": {
                "buildingClasses": data.get("buildingClasses", ["Class_X"])
            }
        }

        if content_type == "list":
            block.update({
                "listType": data.get("listType", "unordered"),
                "items": data.get("items", [])
            })
        elif content_type == "table":
            block.update({
                "headers": data.get("headers", []),
                "rows": data.get("rows", [])
            })
        elif content_type == "button":
            block.update({
                "text": data.get("text", ""),
                "link": data.get("link", "")
            })

        return block

    def generate_json(self, data: Dict[str, Any], section_id: str, document_name: str) -> str:
        """Generate a JSON file for the analyzed section using the template format."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{document_name}_{section_id}_{timestamp}.json"
        filepath = os.path.join(self.output_dir, filename)

        # Create a new JSON structure based on the template
        output_data = self.template.copy()
        
        # Update basic information
        output_data.update({
            "lastUpdated": datetime.now().strftime("%Y-%m-%d"),
            "sectionId": section_id,
            "title": data.get("title", f"Section {section_id}"),
            "displayOrder": data.get("displayOrder", 0),
            "overallApplicability": data.get("overallApplicability", self.template["overallApplicability"]),
            "metadata": {
                "source": data.get("source", "NCC 2024"),
                "lastReviewed": datetime.now().strftime("%Y-%m-%d"),
                "reviewedBy": data.get("reviewedBy", "System"),
                "status": "active"
            }
        })

        # Process content blocks
        content_blocks = []
        if "content" in data:
            content = data["content"]
            if isinstance(content, dict):
                # Single content block
                content_blocks.append(self._create_content_block(
                    content.get("type", "text"),
                    content
                ))
            elif isinstance(content, list):
                # Multiple content blocks
                for block in content:
                    content_blocks.append(self._create_content_block(
                        block.get("type", "text"),
                        block
                    ))

        output_data["contentBlocks"] = content_blocks

        # Write the JSON file
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)

        return filepath

    def merge_json_files(self, json_files: list[str], output_filename: str) -> str:
        """Merge multiple JSON files into a single file."""
        merged_data = {
            "version": "1.0",
            "lastUpdated": datetime.now().strftime("%Y-%m-%d"),
            "sections": [],
            "metadata": {
                "source": "NCC 2024",
                "lastReviewed": datetime.now().strftime("%Y-%m-%d"),
                "reviewedBy": "System",
                "status": "active"
            }
        }

        for file_path in json_files:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                merged_data["sections"].append(data)

        output_path = os.path.join(self.output_dir, output_filename)
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(merged_data, f, indent=2, ensure_ascii=False)

        return output_path 