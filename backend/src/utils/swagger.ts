import m2s from 'mongoose-to-swagger';
import User from '../login/models/users.models';
import Participant from '../stripe/models/participant.models';
import swaggerJsdoc from 'swagger-jsdoc';
import yaml from 'yamljs';
import path from 'path';

const userRoutesDocs = yaml.load(
  path.join(__dirname, 'swaggerRoutes', 'userRoutes.swagger.yml')
);
const authRoutesDocs = yaml.load(
  path.join(__dirname, 'swaggerRoutes', 'authRoutes.swagger.yml')
);
const participanthRoutesDocs = yaml.load(
  path.join(__dirname, 'swaggerRoutes', 'participantRoutes.swagger.yml')
);

const options = {
  definition: {
    openapi: '3.1.0',
    info: {
      version: '1.0.0',
      title: 'User and Auth API',
      description: 'An application for managing users and authentication (JWT and Google login)',
    },
    components: {
      schemas: {
        User: m2s(User),
        Participant: m2s(Participant)
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{ bearerAuth: [] }],
    paths: {
      ...userRoutesDocs.paths,
      ...authRoutesDocs.paths,
      ...participanthRoutesDocs.paths, // merge
    },
  },
  apis: []
  // δεν το χρησιμοποιούμε αυτό γιατι εχουν μεταφερθεί τα swagger docs στo yaml αρχειο
  // 👇 This is the critical part: tell swagger-jsdoc where to find your route/controller annotations
  // apis: ['./routes/*.js', './controllers/*.js'], // adjust paths if needed
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
