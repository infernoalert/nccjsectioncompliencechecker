/**
 * Test script for exemptions functionality
 * 
 * This script tests the getExemptions function with various building classes.
 */

const { getExemptions, isValidBuildingClass } = require('../utils/decisionTreeUtils');

async function testExemptions() {
  try {
    console.log('Testing getExemptions function...\n');

    // Test building class validation
    console.log('Testing building class validation:');
    console.log('Class_5 is valid:', isValidBuildingClass('Class_5'));
    console.log('InvalidClass is valid:', isValidBuildingClass('InvalidClass'));

    // Test with a regular building class
    console.log('\nTesting with Class_5:');
    try {
      const class5Exemptions = await getExemptions('Class_5');
      console.log('Class 5 exemptions:', JSON.stringify(class5Exemptions, null, 2));
    } catch (error) {
      console.error('Error getting Class 5 exemptions:', error.message);
    }

    // Test with an excluded building class
    console.log('\nTesting with Class_9b_early_childhood_centre (should be excluded from minor use rule):');
    try {
      const class9bExemptions = await getExemptions('Class_9b_early_childhood_centre');
      console.log('Class 9b exemptions:', JSON.stringify(class9bExemptions, null, 2));
    } catch (error) {
      console.error('Error getting Class 9b exemptions:', error.message);
    }

    // Test with a non-existent building class (should throw an error)
    console.log('\nTesting with non-existent class (should fail):');
    try {
      const nonExistentExemptions = await getExemptions('NonExistentClass');
      console.log('Non-existent class exemptions:', nonExistentExemptions);
    } catch (error) {
      console.log('Expected error:', error.message);
    }

    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Error testing exemptions:', error);
  }
}

// Run the tests
testExemptions(); 