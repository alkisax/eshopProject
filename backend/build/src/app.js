"use strict";
/* eslint-disable no-console */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// import type { NextFunction } from 'express';
const path_1 = __importDefault(require("path"));
const swagger_1 = __importDefault(require("./utils/swagger"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const auth_routes_1 = __importDefault(require("./login/routes/auth.routes"));
const user_routes_1 = __importDefault(require("./login/routes/user.routes"));
const participant_routes_1 = __importDefault(require("./stripe/routes/participant.routes"));
const transaction_routes_1 = __importDefault(require("./stripe/routes/transaction.routes"));
const email_routes_1 = __importDefault(require("./stripe/routes/email.routes"));
const stripe_routes_1 = __importDefault(require("./stripe/routes/stripe.routes"));
const commodity_routes_1 = __importDefault(require("./stripe/routes/commodity.routes"));
const cart_routes_1 = __importDefault(require("./stripe/routes/cart.routes"));
const upload_routes_1 = __importDefault(require("./uploadMulter/upload.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// app.use((req: Request, _res: Response, next: NextFunction) => {
//   console.log("Request reached Express!");
//   console.log(`Incoming request: ${req.method} ${req.path}`);
//   next();
// });
app.get('/api/ping', (_req, res) => {
    console.log('someone pinged here');
    res.send('pong');
});
app.get('/health', (_req, res) => {
    res.send('ok');
});
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/participant', participant_routes_1.default);
app.use('/api/transaction', transaction_routes_1.default);
app.use('/api/email', email_routes_1.default);
app.use('/api/stripe', stripe_routes_1.default);
app.use('/api/commodity', commodity_routes_1.default);
app.use('/api/cart', cart_routes_1.default);
app.use('/api/upload-multer', upload_routes_1.default);
app.use(express_1.default.static('dist'));
// swagger test page
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default));
// ✅ SERVE UPLOADS BEFORE DIST
// ΠΡΟΣΟΧΗ το ../ στο path είναι συμαντικο. τα αρχεια μας βρίσκονται τελικά στον φάκελο dist
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// για να σερβίρει τον φακελο dist του front μετα το npm run build
// app.use(express.static('dist'));
app.use(express_1.default.static(path_1.default.join(__dirname, '../../dist')));
//αυτο είναι για να σερβίρει το index.html του front όταν ο χρήστης επισκέπτεται το root path ή οποιοδήποτε άλλο path που δεν είναι api ή api-docs
app.get(/^\/(?!api|api-docs).*/, (_req, res) => {
    // res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    res.sendFile(path_1.default.join(__dirname, '../../dist', 'index.html'));
});
exports.default = app;
//# sourceMappingURL=app.js.map