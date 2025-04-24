// Simple test file to verify the decision tree factory
const fs = require('fs');
const path = require('path');

// Use relative paths consistently
const decisionTreePath = path.join(__dirname, '..', 'data', 'Decision-Tree.json');

// Try to load the decision tree
try {
  console.log('Attempting to load the decision tree...');
  const decisionTree = JSON.parse(fs.readFileSync(decisionTreePath, 'utf8'));
  console.log('Decision tree loaded successfully!');
  console.log('Version:', decisionTree.version);
  console.log('Last updated:', decisionTree.last_updated);
  
  // Check if the decision tree has the expected structure
  if (decisionTree.decision_tree) {
    console.log('Decision tree has the expected structure.');
    
    // List the sections in the decision tree
    const sections = Object.keys(decisionTree.decision_tree);
    console.log('Sections in the decision tree:', sections);
    
    // Check if the exemptions section exists
    if (decisionTree.decision_tree.exemptions) {
      console.log('Exemptions section exists.');
    } else {
      console.log('Exemptions section does not exist.');
    }
  } else {
    console.log('Decision tree does not have the expected structure.');
  }
} catch (error) {
  console.error('Error loading the decision tree:', error.message);
} 