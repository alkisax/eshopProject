import m2s from 'mongoose-to-swagger';
import User from '../login/models/users.models';
import Participant from '../stripe/models/participant.models';
import Transaction from '../stripe/models/transaction.models';
import Commodity from '../stripe/models/commodity.models';
import Cart from '../stripe/models/cart.models';
import Upload from '../uploadMulter/upload.model';
import Category from '../stripe/models/category.models';
import Post from '../blog/models/post.model';
import SubPage from '../blog/models/subPage.model';
import swaggerJsdoc from 'swagger-jsdoc';
import yaml from 'yamljs';
import path from 'path';

const userRoutesDocs = yaml.load(
  path.join(__dirname, 'swaggerRoutes', 'userRoutes.swagger.yml')
);
const authRoutesDocs = yaml.load(
  path.join(__dirname, 'swaggerRoutes', 'authRoutes.swagger.yml')
);
const participantRoutesDocs = yaml.load(
  path.join(__dirname, 'swaggerRoutes', 'participantRoutes.swagger.yml')
);
const transactionRoutesDocs = yaml.load(
  path.join(__dirname, 'swaggerRoutes', 'transactionRoutes.swagger.yml')
);
const emailRoutesDocs = yaml.load(
  path.join(__dirname, 'swaggerRoutes', 'emailRoutes.swagger.yml')
);
const stripeRoutesDocs = yaml.load(
  path.join(__dirname, 'swaggerRoutes', 'stripeRoutes.swagger.yml')
);
const commodityRoutesDocs = yaml.load(
  path.join(__dirname, 'swaggerRoutes', 'commodityRoutes.swagger.yml')
);
const cartRoutesDocs = yaml.load(
  path.join(__dirname, 'swaggerRoutes', 'cartRoutes.swagger.yml' )
);
const uploadMulterRoutesDocs = yaml.load(
  path.join(__dirname, 'swaggerRoutes', 'uploadMulterRoutes.swagger.yml' )
);
const categoriesRoutesDocs = yaml.load(
  path.join(__dirname, 'swaggerRoutes', 'categoriesRoutes.swagger.yml' )
);
const postRoutesDocs = yaml.load(
  path.join(__dirname, 'swaggerRoutes', 'postRoutes.swagger.yml' )
);
const subPageRoutesDocs = yaml.load(
  path.join(__dirname, 'swaggerRoutes', 'subPageRoutes.swagger.yml' )
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
        Participant: m2s(Participant),
        Transaction: m2s(Transaction),
        Commodity: m2s(Commodity),
        Cart: m2s(Cart),
        Multer: m2s(Upload),
        Category: m2s(Category),
        Post: m2s(Post),
        SubPage: m2s(SubPage)
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
      ...authRoutesDocs.paths,
      ...userRoutesDocs.paths,
      ...participantRoutesDocs.paths,
      ...commodityRoutesDocs.paths,
      ...cartRoutesDocs.paths,
      ...transactionRoutesDocs.paths,
      ...emailRoutesDocs.paths,
      ...stripeRoutesDocs.paths,
      ...uploadMulterRoutesDocs.paths,
      ...categoriesRoutesDocs.paths,
      ...postRoutesDocs.paths,
      ...subPageRoutesDocs.paths, // merge
    },
  },
  apis: []
  // δεν το χρησιμοποιούμε αυτό γιατι εχουν μεταφερθεί τα swagger docs στo yaml αρχειο
  // 👇 This is the critical part: tell swagger-jsdoc where to find your route/controller annotations
  // apis: ['./routes/*.js', './controllers/*.js'], // adjust paths if needed
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
