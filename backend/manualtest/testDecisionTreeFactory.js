/**
 * Test script for decisionTreeFactory.js
 * 
 * This script tests the functionality of the decisionTreeFactory.js module.
 */

const { getSection } = require('../utils/decisionTreeFactory');

async function testDecisionTreeFactory() {
  try {
    console.log('Testing getSection function...');
    
    // Test loading exemptions from modular structure
    console.log('\nTesting loading exemptions from modular structure:');
    const exemptions = await getSection('exemptions');
    console.log('Exemptions loaded successfully:', JSON.stringify(exemptions, null, 2));
    
    // Test loading building_classification from monolithic tree
    console.log('\nTesting loading building_classification from monolithic tree:');
    const buildingClass = await getSection('building_classification');
    if (buildingClass) {
      console.log('Building classification loaded successfully from monolithic tree');
      console.log('Available building classes:', Object.keys(buildingClass));
    } else {
      console.log('Failed to load building classification from monolithic tree');
    }
    
    // Test loading a non-existent section
    console.log('\nTesting loading non-existent section:');
    const nonExistent = await getSection('non-existent-section');
    console.log('Non-existent section result:', nonExistent);
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Error testing decisionTreeFactory:', error);
  }
}

// Run the tests
testDecisionTreeFactory(); 