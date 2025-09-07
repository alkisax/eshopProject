"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-console */
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const PORT = process.env.BACK_END_PORT || 3001;
if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in the environment variables');
}
mongoose_1.default.set('strictQuery', false);
// συνδεση με την MongoDB
mongoose_1.default.connect(process.env.MONGODB_URI)
    .then(() => {
    console.log('connected to MongoDB');
    console.log('Routes setup complete. Starting server...');
    // εδώ είναι το βασικό listen PORT μου
    app_1.default.listen(PORT, () => {
        console.log(`Server running on port http://localhost:${PORT}`);
        console.log(`Visit swaggeer at http://localhost:${PORT}/api-docs`);
    });
})
    .catch((error) => {
    console.error('error connecting to MongoDB:', error.message);
});
//# sourceMappingURL=server.js.map