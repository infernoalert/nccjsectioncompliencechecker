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

            const analysis = this._parseAnalysisResponse(response.choices[0].message.content);
            
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
        You are an expert compliance analyst specializing in building services. Your task is to review the provided building document text and identify the presence of specific building services.

        For each service listed below, determine if it exists or is explicitly mentioned in the document. Consider common abbreviations or alternative phrasing (e.g., "AC" for "Air Conditioning," "PV" for "Photovoltaic" in "Renewable Energy").

        If a service is mentioned or clearly implied, mark it as \`true\`.
        If a service is not mentioned anywhere in the document, or is explicitly stated as absent, mark it as \`false\`.

        For any identified energy monitoring systems, provide detailed information including:
        - System type
        - Name/model
        - Part number
        - Description
        - Manufacturer
        - Technical specifications

        Do not make assumptions if information is genuinely missing. Only mark as \`true\` if there is evidence of existence.

        Provide your response strictly as a JSON object with the following structure:
        {
            "airConditioning": boolean,
            "artificialLighting": boolean,
            "appliancePower": boolean,
            "centralHotWaterSupply": boolean,
            "internalTransportDevices": boolean,
            "renewableEnergy": boolean,
            "evChargingEquipment": boolean,
            "batterySystems": boolean,
            "energyMonitoring": {
                "systemType": string,
                "name": string,
                "partNumber": string,
                "description": string,
                "manufacturer": string,
                "specifications": object
            }
        }

        Here are the services to identify:
        - Air Conditioning
        - Artificial Lighting
        - Appliance Power
        - Central Hot Water Supply
        - Internal Transport Devices
        - Renewable Energy
        - EV Charging Equipment
        - Battery Systems

        ---
        Document Text:
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
            // Try to parse the response as JSON
            const analysis = JSON.parse(response);
            
            // Ensure all required fields are present with default values
            return {
                airConditioning: analysis.airConditioning || false,
                artificialLighting: analysis.artificialLighting || false,
                appliancePower: analysis.appliancePower || false,
                centralHotWaterSupply: analysis.centralHotWaterSupply || false,
                internalTransportDevices: analysis.internalTransportDevices || false,
                renewableEnergy: analysis.renewableEnergy || false,
                evChargingEquipment: analysis.evChargingEquipment || false,
                batterySystems: analysis.batterySystems || false,
                energyMonitoring: analysis.energyMonitoring || null,
                rawAnalysis: response
            };
        } catch (error) {
            // If parsing fails, create a basic structure with all fields set to false
            return {
                airConditioning: false,
                artificialLighting: false,
                appliancePower: false,
                centralHotWaterSupply: false,
                internalTransportDevices: false,
                renewableEnergy: false,
                evChargingEquipment: false,
                batterySystems: false,
                energyMonitoring: null,
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