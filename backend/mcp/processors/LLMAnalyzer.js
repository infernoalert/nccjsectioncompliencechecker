const { OpenAI } = require('openai');

class LLMAnalyzer {
    constructor(apiKey) {
        this.openai = new OpenAI({ apiKey });
        this.model = 'gpt-4-turbo-preview';
    }

    async analyzeText(text, documentType = 'regular', processingInfo = {}) {
        try {
            const prompt = this._createAnalysisPrompt(text, documentType, processingInfo);
            
            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: this._getSystemPrompt(documentType)
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: documentType === 'electrical_spec' ? 0.1 : 0.3, // Lower temperature for electrical specs
                max_tokens: documentType === 'electrical_spec' ? 1500 : 1000 // More tokens for electrical specs
            });

            console.log('Raw LLM Response:', JSON.stringify(response.choices[0].message.content, null, 2));
            
            const analysis = this._parseAnalysisResponse(response.choices[0].message.content, documentType);
            
            console.log('Parsed Analysis:', JSON.stringify(analysis, null, 2));
            
            return {
                success: true,
                results: analysis,
                documentType: documentType,
                processingInfo: processingInfo
            };
        } catch (error) {
            return {
                success: false,
                error: `Analysis failed: ${error.message}`,
                documentType: documentType
            };
        }
    }

    _getSystemPrompt(documentType) {
        if (documentType === 'electrical_spec') {
            return `You are an expert electrical engineer and compliance analyst specializing in electrical specifications and building services. Your task is to analyze electrical specification documents and identify energy monitoring systems, smart meters, electrical panels, and monitoring devices with high precision and technical accuracy.

Focus on:
- Energy monitoring panels and devices
- Smart meters and sub-meters
- Distribution boards with monitoring capabilities
- Load monitoring systems
- Energy management system components
- Current transformers and measurement equipment
- Communications protocols for monitoring (Modbus, BACnet, etc.)

Provide detailed technical specifications when available.`;
        } else {
            return `You are an expert compliance analyst specializing in building services. Your task is to review building documents and identify specific building services with high accuracy.

Focus on identifying energy monitoring systems or electrical devices from both text and visual elements in the document.`;
        }
    }

    async needsAdditionalAnalysis(currentResults) {
        // Check if we need additional analysis based on current results
        if (!currentResults || !currentResults.hasAirConditioning) {
            return true;
        }

        // Add more conditions for additional analysis if needed
        return false;
    }

    async performAdditionalAnalysis(currentResults) {
        try {
            const prompt = this._createAdditionalAnalysisPrompt(currentResults);
            
            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert in analyzing construction and building documents. Perform additional analysis on the provided results.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 1000
            });

            const additionalAnalysis = this._parseAdditionalAnalysisResponse(
                response.choices[0].message.content,
                currentResults
            );
            
            return {
                success: true,
                results: additionalAnalysis
            };
        } catch (error) {
            return {
                success: false,
                error: `Additional analysis failed: ${error.message}`
            };
        }
    }

    _createAnalysisPrompt(text, documentType, processingInfo) {
        if (documentType === 'electrical_spec') {
            return this._createElectricalSpecPrompt(text, processingInfo);
        } else {
            return this._createRegularDocumentPrompt(text, processingInfo);
        }
    }

    _createElectricalSpecPrompt(text, processingInfo) {
        return `
You are analyzing an electrical specification document (${processingInfo.pageCount} pages) processed using text parsing only.

Your task is to identify **energy monitoring systems**, **electrical meters**, and **monitoring equipment** from this technical specification.

Focus on identifying:
- Energy monitoring panels and devices (EM panels, smart meters, sub-meters)
- Distribution boards with monitoring capabilities (MSSB, MSB, DB with monitoring)
- Load monitoring systems and current transformers
- Energy management system components
- Communication modules (Modbus, BACnet, Ethernet, RS485)
- Meter specifications and technical details

Look for these patterns in electrical specifications:
- Device labels: "M", "M1", "EM", "HDB-CP", "TMP", "SM" (Smart Meter)
- Panel references: "MSSB", "MSB", "DB", "MCC", "PCC"
- Monitoring equipment: "Current Transformer", "CT", "Energy Meter", "Power Meter"
- Communication protocols: "Modbus RTU", "BACnet", "Ethernet", "RS485"

For **each** identified energy monitoring device, provide:
- **label** (exact device reference from specification)
- **panel** (associated electrical panel or board)
- **type** (smart meter, energy monitoring panel, CT, power meter, etc.)
- **description** (technical specifications, ratings, communication protocol)
- **connection** (circuit breaker, feeder, communication connection)
- **specifications** (voltage, current, accuracy class, protocol if available)

Return the result as a JSON array under the key \`"energyMonitoringDevices"\`. Follow this structure exactly:

{
  "energyMonitoringDevices": [
    {
      "label": "M1",
      "panel": "MSSB-B-01N",
      "type": "smart meter",
      "description": "3-phase smart meter with Modbus RTU communication, Class 1 accuracy",
      "connection": "Connected via 100A MCCB to MSSB-B-01N",
      "specifications": "415V, 100A, Modbus RTU, Class 1 accuracy"
    },
    ...
  ]
}

Only include devices with clear evidence in the specification. If no monitoring devices are found, return:
{
  "energyMonitoringDevices": []
}

Electrical Specification Text:
---
${text}
---
JSON Output:
`;
    }

    _createRegularDocumentPrompt(text, processingInfo) {
        return `
You are analyzing a regular building document (${processingInfo.pageCount} pages) processed using both text parsing and OCR.

Your task is to analyze the following document text and identify **energy monitoring systems** or **electrical meters**, including smart meters or load monitoring panels.

Devices may appear with varying labels such as "M", "M1", "HDB-CP1", "HDB-5", or others. Do **not** assume standard naming. Consider these patterns:
- Any label starting with "M", "HDB", or "TMP"
- Any component that likely represents a meter, smart meter, monitoring panel, or device involved in energy measurement

For **each** identified energy monitoring device, provide:
- **label** (e.g., "M1", "HDB-CP1")
- **associated board or panel** (e.g., MSSB-R-01N, TMP-3)
- **device type** (e.g., smart meter, energy monitoring panel)
- **description** (any available technical details)
- **connection point** (if connected via MCCB, MSB, or DB, specify it)

Return the result as a JSON array under the key \`"energyMonitoringDevices"\`. Follow this structure exactly:

{
  "energyMonitoringDevices": [
    {
      "label": "M1",
      "panel": "MSSB-B-01N",
      "type": "smart meter",
      "description": "Connected via 100A MCCB, used for monitoring load on MSSB",
      "connection": "MCCB 100A, MSSB-B-01N"
    },
    ...
  ]
}

Only include devices with sufficient evidence. If no devices are found, return:
{
  "energyMonitoringDevices": []
}

Document Text:
---
${text}
---
JSON Output:
`;
    }

    _createAdditionalAnalysisPrompt(currentResults) {
        return `
        Based on the current analysis results:
        ${JSON.stringify(currentResults, null, 2)}

        Please perform additional analysis focusing on:
        1. Detailed specifications of air conditioning systems
        2. Energy efficiency considerations
        3. Maintenance requirements
        4. Compliance with building codes
        5. Integration with other building systems

        Format the response as a JSON object that can be merged with the current results.
        `;
    }

    _parseAnalysisResponse(response, documentType) {
        try {
            // Clean the response by removing markdown code blocks if present
            let cleanedResponse = response;
            if (response.includes('```json')) {
                cleanedResponse = response.split('```json')[1].split('```')[0].trim();
            } else if (response.includes('```')) {
                cleanedResponse = response.split('```')[1].split('```')[0].trim();
            }
            
            console.log('Cleaned JSON response:', cleanedResponse);
            
            // Try to parse the cleaned response as JSON
            const analysis = JSON.parse(cleanedResponse);
            
            // Ensure we have the energyMonitoringDevices array
            if (!analysis.energyMonitoringDevices || !Array.isArray(analysis.energyMonitoringDevices)) {
                return {
                    energyMonitoringDevices: [],
                    rawAnalysis: response,
                    documentType: documentType,
                    error: 'Invalid response format: missing energyMonitoringDevices array'
                };
            }

            // Validate each device in the array based on document type
            const validatedDevices = analysis.energyMonitoringDevices.map(device => {
                const baseDevice = {
                    label: device.label || '',
                    panel: device.panel || '',
                    type: device.type || '',
                    description: device.description || '',
                    connection: device.connection || ''
                };

                // Add specifications field for electrical specs
                if (documentType === 'electrical_spec' && device.specifications) {
                    baseDevice.specifications = device.specifications;
                }

                return baseDevice;
            });

            return {
                energyMonitoringDevices: validatedDevices,
                rawAnalysis: response,
                documentType: documentType,
                analysisType: documentType === 'electrical_spec' ? 'detailed_electrical_spec' : 'general_document'
            };
        } catch (error) {
            // If parsing fails, return empty array
            console.error('Failed to parse LLM response:', error);
            console.error('Raw response:', response);
            return {
                energyMonitoringDevices: [],
                rawAnalysis: response,
                documentType: documentType,
                error: 'Failed to parse analysis response'
            };
        }
    }

    _parseAdditionalAnalysisResponse(response, currentResults) {
        try {
            // Try to parse the additional analysis
            const additionalAnalysis = JSON.parse(response);
            
            // Merge with current results
            return {
                ...currentResults,
                ...additionalAnalysis,
                additionalAnalysis: response
            };
        } catch (error) {
            return {
                ...currentResults,
                additionalAnalysis: response,
                error: 'Failed to parse additional analysis response'
            };
        }
    }
}

module.exports = LLMAnalyzer; 