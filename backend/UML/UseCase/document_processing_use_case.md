# Document Processing Use Case

## Use Case: Process Document and Generate Diagram

### Primary Actor
- User
- System
- LLM Service

### Stakeholders and Interests
- User: Wants to analyze document and get visual representation
- System: Needs to coordinate between different services
- LLM Service: Processes document content
- JSON Generator Service: Creates structured data
- Diagram Generator Service: Creates visual representation

### Preconditions
- User has a valid document to process
- System is operational
- All required services are available

### Main Success Scenario
1. User uploads document to the system
2. System sends document to LLM service
3. LLM extracts relevant data from document
4. System updates project data with extracted information
5. System sends updated data to JSON Generator Service
6. JSON Generator Service creates structured JSON file
7. System sends JSON file to Diagram Generator Service
8. Diagram Generator Service creates visual diagram
9. System presents diagram to user

### Extensions
1a. Document format is invalid
   - System notifies user of invalid format
   - Use case ends

2a. LLM service is unavailable
   - System notifies user of service unavailability
   - Use case ends

3a. Data extraction fails
   - System logs error
   - System notifies user of extraction failure
   - Use case ends

4a. Project data update fails
   - System logs error
   - System notifies user of update failure
   - Use case ends

5a. JSON generation fails
   - System logs error
   - System notifies user of generation failure
   - Use case ends

6a. Diagram generation fails
   - System logs error
   - System notifies user of generation failure
   - Use case ends

### Postconditions
- Document is processed
- Project data is updated
- JSON file is generated
- Diagram is created and presented to user 