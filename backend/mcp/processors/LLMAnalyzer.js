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
                        content: 'You are an expert in analyzing construction and building documents. Extract key information about air conditioning systems and other relevant details.'
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
        Analyze the following text from a construction or building document and extract information about air conditioning systems and other relevant details:

        ${text}

        Please provide a structured analysis with the following information:
        1. Presence of air conditioning systems
        2. Type of air conditioning system (if present)
        3. Location of air conditioning units
        4. Any specific requirements or regulations mentioned
        5. Other relevant building systems or features

        Format the response as a JSON object with these fields.
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
            
            // Ensure required fields are present
            return {
                hasAirConditioning: analysis.hasAirConditioning || false,
                acType: analysis.acType || null,
                acLocation: analysis.acLocation || null,
                requirements: analysis.requirements || [],
                otherSystems: analysis.otherSystems || [],
                rawAnalysis: response
            };
        } catch (error) {
            // If parsing fails, create a basic structure
            return {
                hasAirConditioning: false,
                acType: null,
                acLocation: null,
                requirements: [],
                otherSystems: [],
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