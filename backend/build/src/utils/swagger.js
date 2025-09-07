"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_to_swagger_1 = __importDefault(require("mongoose-to-swagger"));
const users_models_1 = __importDefault(require("../login/models/users.models"));
const participant_models_1 = __importDefault(require("../stripe/models/participant.models"));
const transaction_models_1 = __importDefault(require("../stripe/models/transaction.models"));
const commodity_models_1 = __importDefault(require("../stripe/models/commodity.models"));
const cart_models_1 = __importDefault(require("../stripe/models/cart.models"));
const upload_model_1 = __importDefault(require("../uploadMulter/upload.model"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const yamljs_1 = __importDefault(require("yamljs"));
const path_1 = __importDefault(require("path"));
const userRoutesDocs = yamljs_1.default.load(path_1.default.join(__dirname, 'swaggerRoutes', 'userRoutes.swagger.yml'));
const authRoutesDocs = yamljs_1.default.load(path_1.default.join(__dirname, 'swaggerRoutes', 'authRoutes.swagger.yml'));
const participantRoutesDocs = yamljs_1.default.load(path_1.default.join(__dirname, 'swaggerRoutes', 'participantRoutes.swagger.yml'));
const transactionRoutesDocs = yamljs_1.default.load(path_1.default.join(__dirname, 'swaggerRoutes', 'transactionRoutes.swagger.yml'));
const emailRoutesDocs = yamljs_1.default.load(path_1.default.join(__dirname, 'swaggerRoutes', 'emailRoutes.swagger.yml'));
const stripeRoutesDocs = yamljs_1.default.load(path_1.default.join(__dirname, 'swaggerRoutes', 'stripeRoutes.swagger.yml'));
const commodityRoutesDocs = yamljs_1.default.load(path_1.default.join(__dirname, 'swaggerRoutes', 'commodityRoutes.swagger.yml'));
const cartRoutesDocs = yamljs_1.default.load(path_1.default.join(__dirname, 'swaggerRoutes', 'cartRoutes.swagger.yml'));
const uploadMulterRoutesDocs = yamljs_1.default.load(path_1.default.join(__dirname, 'swaggerRoutes', 'uploadMulterRoutes.swagger.yml'));
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
                User: (0, mongoose_to_swagger_1.default)(users_models_1.default),
                Participant: (0, mongoose_to_swagger_1.default)(participant_models_1.default),
                Transaction: (0, mongoose_to_swagger_1.default)(transaction_models_1.default),
                Commodity: (0, mongoose_to_swagger_1.default)(commodity_models_1.default),
                Cart: (0, mongoose_to_swagger_1.default)(cart_models_1.default),
                Multer: (0, mongoose_to_swagger_1.default)(upload_model_1.default)
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
            ...uploadMulterRoutesDocs.paths, // merge
        },
    },
    apis: []
    // δεν το χρησιμοποιούμε αυτό γιατι εχουν μεταφερθεί τα swagger docs στo yaml αρχειο
    // 👇 This is the critical part: tell swagger-jsdoc where to find your route/controller annotations
    // apis: ['./routes/*.js', './controllers/*.js'], // adjust paths if needed
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
exports.default = swaggerSpec;
//# sourceMappingURL=swagger.js.map