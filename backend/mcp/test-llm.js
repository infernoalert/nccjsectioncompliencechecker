const LLMAnalyzer = require('./processors/LLMAnalyzer');

async function testLLM() {
    try {
        const analyzer = new LLMAnalyzer(process.env.OPENAI_API_KEY);
        const result = await analyzer.analyzeText('Sample text with air conditioning system mentioned.');
        console.log('Test Result:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Test Error:', error);
    }
}

testLLM(); 