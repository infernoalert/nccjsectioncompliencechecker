const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

// Log the environment for debugging
console.log('Swagger NODE_ENV:', process.env.NODE_ENV);
console.log('Swagger Environment Variables:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  MONGO_PATH: process.env.MONGO_PATH
});

// Log the current working directory and file paths
console.log('Current working directory:', process.cwd());
console.log('Swagger config file location:', __dirname);

// Define server URLs for different environments
// Use relative URLs instead of absolute URLs
const developmentServer = {
  url: 'http://localhost:5000',
  description: 'Development Server'
};

const productionServer = {
  url: 'https://api.payamamerian.com',
  description: 'Production Server'
};

// Define servers based on environment
const servers = process.env.NODE_ENV === 'production'
  ? [productionServer]
  : [developmentServer];

console.log('Selected Swagger Servers:', servers);

// Define API file paths
const apiPaths = [
  path.join(__dirname, '../routes/*.js'),
  path.join(__dirname, '../models/*.js'),
  path.join(__dirname, '../controllers/*.js')
];

console.log('Swagger API paths to scan:', apiPaths);

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NCC Section J Compliance API',
      version: '1.0.0',
      description: 'API documentation for NCC Section J Compliance Checker. This API provides endpoints for managing building compliance, climate zones, and project management.',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: servers,
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: apiPaths
};

const swaggerSpec = swaggerJsdoc(options);
console.log('Swagger spec generated with', Object.keys(swaggerSpec.paths || {}).length, 'paths');

module.exports = swaggerSpec; 