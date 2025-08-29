const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RIAFCO Backoffice API',
      version: '1.0.0',
      description: 'API Documentation for RIAFCO Backoffice',
      contact: {
        name: 'Support',
        email: 'support@riafo.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local server',
        }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js'], // Chemin vers tes fichiers de routes
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
