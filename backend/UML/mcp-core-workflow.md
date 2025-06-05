# MCP Core Workflow Use Cases

## Overview
This document outlines the core workflow use cases for the MCP system, focusing on the essential processes of text extraction, analysis, result viewing, and error handling.

## Core Workflow Use Cases

### 1. Extract Text
**Primary Actor**: User
**Secondary Actor**: System

**Description**: Extract text content from an existing PDF file for analysis.

**Preconditions**:
- PDF file exists on server
- File is accessible
- File format is valid

**Main Flow**:
1. User requests text extraction
2. System validates file
3. System extracts text
4. System stores extracted text
5. System notifies user of completion

**Alternative Flows**:
- File validation fails → System reports error
- Extraction fails → System logs error and notifies user

**Postconditions**:
- Text is extracted and stored
- Extraction status is updated
- History is recorded

### 2. Analyze Text
**Primary Actor**: System
**Secondary Actor**: User

**Description**: Analyze extracted text using LLM to identify air conditioning systems and related information.

**Preconditions**:
- Text is successfully extracted
- LLM service is available
- Analysis parameters are set

**Main Flow**:
1. System prepares text for analysis
2. System sends text to LLM
3. System processes LLM response
4. System stores analysis results
5. System updates project status

**Alternative Flows**:
- LLM service unavailable → System retries
- Invalid response → System attempts parsing
- Analysis fails → System logs error

**Postconditions**:
- Analysis results are stored
- Project status is updated
- Analysis history is recorded

### 3. View Results
**Primary Actor**: User
**Secondary Actor**: System

**Description**: View and interact with analysis results.

**Preconditions**:
- Analysis is complete
- Results are available
- User has access

**Main Flow**:
1. User requests results
2. System retrieves results
3. System formats results
4. System displays results
5. User views results

**Alternative Flows**:
- Results not found → System notifies user
- Formatting fails → System shows raw results

**Postconditions**:
- Results are displayed
- View history is recorded

### 4. Handle Errors
**Primary Actor**: System
**Secondary Actor**: User

**Description**: Manage and respond to errors during processing.

**Preconditions**:
- Error has occurred
- Error details are available
- System is in recoverable state

**Main Flow**:
1. System detects error
2. System logs error
3. System determines error type
4. System attempts recovery
5. System notifies user
6. System updates status

**Alternative Flows**:
- Recovery fails → System prepares for retry
- Critical error → System stops processing

**Postconditions**:
- Error is logged
- System state is updated
- User is notified

### 5. Retry Failed Step
**Primary Actor**: User
**Secondary Actor**: System

**Description**: Retry a previously failed processing step.

**Preconditions**:
- Step has failed
- Error is handled
- System is ready for retry

**Main Flow**:
1. User initiates retry
2. System validates retry
3. System resets state
4. System retries step
5. System processes result
6. System updates status

**Alternative Flows**:
- Retry not possible → System notifies user
- Retry fails → System logs failure

**Postconditions**:
- Step is retried
- Result is processed
- Status is updated

## System Requirements

### Performance
- Text extraction: < 30 seconds
- Analysis: < 2 minutes
- Results display: < 3 seconds
- Error handling: < 5 seconds

### Security
- Authenticated file access
- Authorized result viewing
- Secure error logging
- Protected retry operations

### Reliability
- Max file size: 10MB
- Max retry attempts: 3
- State preservation
- Clear error messages

### Interface
- Status indicators
- Error notifications
- Progress tracking
- Formatted results

## Implementation Notes

### Error Handling
- All errors are logged
- User notifications are clear
- Recovery is attempted
- State is preserved

### State Management
- Each step has clear state
- Transitions are tracked
- History is maintained
- Status is updated

### User Interaction
- Clear status updates
- Progress indication
- Error notifications
- Result presentation

### System Monitoring
- Step completion tracking
- Error rate monitoring
- Performance metrics
- Usage statistics 