const normalizerConfig = require('../data/APIstep1.json');

function normalizeResponse(response, currentData = {}) {
  console.log('\n=== Response Normalization Started ===');
  console.log('Input Response:', response);
  console.log('Current Data:', JSON.stringify(currentData, null, 2));

  const normalizer = normalizerConfig.normalizer;
  console.log('\nUsing Normalizer Config:', {
    functionName: normalizer.functionName,
    requiredFields: normalizer.requiredFields,
    patterns: Object.keys(normalizer.patterns)
  });

  const result = {
    functionName: normalizer.functionName,
    arguments: {}
  };

  // Process each field according to its pattern
  for (const [fieldName, fieldConfig] of Object.entries(normalizer.patterns)) {
    console.log(`\nProcessing field: ${fieldName}`);
    console.log('Field Config:', fieldConfig);

    let value = null;
    if (fieldConfig.type === 'object' && fieldName === 'buildingServices') {
      // Enhanced: Parse both Yes and No for each service
      value = { ...currentData[fieldName] };
      for (const extractor of fieldConfig.extractors) {
        console.log(`Trying extractor pattern: ${extractor.pattern}`);
        const regex = new RegExp(extractor.pattern, 'gi');
        let match;
        while ((match = regex.exec(response)) !== null) {
          const serviceName = match[1];
          const answer = match[2];
          for (const [field, synonyms] of Object.entries(extractor.fields)) {
            if (synonyms.some(synonym => serviceName.toLowerCase().includes(synonym.toLowerCase()))) {
              value[field] = /yes|true|required|needed/i.test(answer);
              if (/no|false|not required|not needed/i.test(answer)) value[field] = false;
              console.log(`Set ${field} to`, value[field]);
              break;
            }
          }
        }
      }
    } else if (fieldConfig.type === 'array') {
      value = [];
      for (const extractor of fieldConfig.extractors) {
        console.log(`Trying extractor pattern: ${extractor.pattern}`);
        const matches = response.match(new RegExp(extractor.pattern, 'gi'));
        if (matches) {
          console.log('Found matches:', matches);
          for (const match of matches) {
            const [_, name] = match.match(new RegExp(extractor.pattern, 'i'));
            console.log('Extracted plant name:', name);
            value.push({
              exists: true,
              name: name.trim()
            });
          }
        }
      }
    } else {
      for (const extractor of fieldConfig.extractors) {
        console.log(`Trying extractor pattern: ${extractor.pattern}`);
        const match = response.match(new RegExp(extractor.pattern, 'i'));
        if (match) {
          console.log('Found match:', match);
          if (fieldConfig.type === 'boolean') {
            value = match[1].toLowerCase().includes('yes') || 
                   match[1].toLowerCase().includes('true') ||
                   match[1].toLowerCase().includes('required') ||
                   match[1].toLowerCase().includes('needed');
          } else if (fieldConfig.type === 'integer') {
            value = parseInt(match[1]);
          } else {
            value = match[1].trim();
          }
          console.log('Extracted value:', value);
          break;
        }
      }
    }

    // Use default value if no match found
    if (value === null) {
      console.log(`No match found, using default value: ${fieldConfig.defaultValue}`);
      value = fieldConfig.defaultValue;
    }

    // Merge with existing data if specified
    if (normalizer.maintainExistingData && currentData[fieldName]) {
      console.log(`Merging with existing data for ${fieldName}:`, currentData[fieldName]);
      if (fieldConfig.type === 'object') {
        value = { ...currentData[fieldName], ...value };
      } else if (fieldConfig.type === 'array') {
        value = [...currentData[fieldName], ...value];
      }
    }

    result.arguments[fieldName] = value;
    console.log(`Final value for ${fieldName}:`, value);
  }

  // Ensure all required fields are present
  for (const field of normalizer.requiredFields) {
    if (!result.arguments[field]) {
      console.log(`Missing required field: ${field}`);
      result.arguments[field] = normalizer.patterns[field].defaultValue;
    }
  }

  console.log('\nFinal Normalized Result:');
  console.log(JSON.stringify(result, null, 2));
  console.log('=== Response Normalization Complete ===\n');

  return result;
}

module.exports = { normalizeResponse }; 