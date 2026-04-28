import swaggerJsdoc from 'swagger-jsdoc';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Courseware API',
      version: '1.0.0',
      description: 'REST API for the Courseware course management platform. Most endpoints require a Bearer JWT token obtained from `POST /auth/login`.',
    },
    servers: [{ url: '/api/v1', description: 'API v1' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token returned by POST /auth/login',
        },
      },
    },
  },
  apis: [path.join(__dirname, 'docs', '*.js')],
};

export const swaggerSpec = swaggerJsdoc(options);
