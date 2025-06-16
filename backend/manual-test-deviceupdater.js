// Simple manual test script for device type updater
// This will help us see what's happening step by step

console.log('🔧 Manual Device Type Updater Test');
console.log('This script will show you exactly what the device updater is doing');

const projectId = '684a53d0312f7c81654304c4';
console.log('📋 Testing with Project ID:', projectId);

// Import and test the function directly
const updateDeviceTypesByProjectSize = require('./utils/deviceTypeUpdater');

console.log('✅ Function imported successfully');
console.log('🚀 Now call this function from your running server...');
console.log('');
console.log('STEPS TO TEST:');
console.log('1. Make sure your server is running (npm run dev or node server.js)');
console.log('2. Go to your browser and navigate to your project');
console.log('3. Check the server console logs for device type updater output');
console.log('4. Or call the function directly from a controller/route');
console.log('');
console.log('ALTERNATIVELY - Test via API:');
console.log('Create a temporary route in your server to test this:');
console.log('');
console.log('// Add this to server.js or a route file:');
console.log(`app.get('/test-device-updater', async (req, res) => {`);
console.log(`  try {`);
console.log(`    const result = await updateDeviceTypesByProjectSize('${projectId}');`);
console.log(`    res.json({ success: true, result });`);
console.log(`  } catch (error) {`);
console.log(`    res.json({ success: false, error: error.message });`);
console.log(`  }`);
console.log(`});`);
console.log('');
console.log('Then visit: http://localhost:5000/test-device-updater'); 