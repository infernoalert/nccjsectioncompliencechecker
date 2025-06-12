const { OpenAI } = require('openai');

class LLMAnalyzer {
    constructor(apiKey) {
        this.openai = new OpenAI({ apiKey });
        this.model = 'gpt-4-turbo-preview';
    }

    async analyzeText(text) {
        try {
            const prompt = this._createAnalysisPrompt(text);
            
            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert compliance analyst specializing in building services. Your task is to review building documents and identify specific building services with high accuracy.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 1000
            });

            console.log('Raw LLM Response:', JSON.stringify(response.choices[0].message.content, null, 2));
            
            const analysis = this._parseAnalysisResponse(response.choices[0].message.content);
            
            console.log('Parsed Analysis:', JSON.stringify(analysis, null, 2));
            
            return {
                success: true,
                results: analysis
            };
        } catch (error) {
            return {
                success: false,
                error: `Analysis failed: ${error.message}`
            };
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

    _createAnalysisPrompt(text) {
        return `
You are an expert compliance analyst in building services and electrical infrastructure.

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

    _parseAnalysisResponse(response) {
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
                    error: 'Invalid response format: missing energyMonitoringDevices array'
                };
            }

            // Validate each device in the array
            const validatedDevices = analysis.energyMonitoringDevices.map(device => ({
                label: device.label || '',
                panel: device.panel || '',
                type: device.type || '',
                description: device.description || '',
                connection: device.connection || ''
            }));

            return {
                energyMonitoringDevices: validatedDevices,
                rawAnalysis: response
            };
        } catch (error) {
            // If parsing fails, return empty array
            console.error('Failed to parse LLM response:', error);
            console.error('Raw response:', response);
            return {
                energyMonitoringDevices: [],
                rawAnalysis: response,
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