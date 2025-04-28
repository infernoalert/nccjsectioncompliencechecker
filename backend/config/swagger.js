const swaggerJsdoc = require('swagger-jsdoc');

// Log the environment for debugging
console.log('Swagger NODE_ENV:', process.env.NODE_ENV);
console.log('Swagger Environment Variables:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  MONGO_PATH: process.env.MONGO_PATH
});

// Define server URLs for different environments
const developmentServer = {
  url: 'http://localhost:5000',
  description: 'Development Server'
};

// Use a more flexible production server configuration
const productionServer = {
  url: process.env.API_URL || 'http://136.243.36.77:9951', // Use environment variable or fallback to IP
  description: 'Production Server'
};

// Define servers based on environment
const servers = process.env.NODE_ENV === 'production'
  ? [productionServer]
  : [developmentServer];

console.log('Selected Swagger Servers:', servers);

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
  apis: [
    './routes/*.js',
    './models/*.js',
    './controllers/*.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec; 