const swaggerJsdoc = require('swagger-jsdoc');

// Log the environment for debugging
console.log('Swagger NODE_ENV:', process.env.NODE_ENV);

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
    servers: [
      {
        url: 'https://api.payamamerian.com',
        description: 'Production server'
      },
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      }
    ],
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