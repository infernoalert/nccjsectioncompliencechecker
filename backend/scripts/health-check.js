const http = require('http');

const options = {
  hostname: 'api.payamamerian.com',
  port: 80,
  path: '/health',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const healthData = JSON.parse(data);
      console.log('Health Check Response:');
      console.log(JSON.stringify(healthData, null, 2));
      
      // Check if the API is healthy
      if (healthData.status === 'ok' && healthData.database.status === 'connected') {
        console.log('\n✅ API is healthy!');
        process.exit(0);
      } else {
        console.log('\n❌ API is not healthy!');
        process.exit(1);
      }
    } catch (error) {
      console.error('Error parsing response:', error);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('Error making request:', error);
  process.exit(1);
});

req.end(); 