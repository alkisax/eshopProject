"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.account = exports.client = void 0;
const appwrite_1 = require("appwrite");
if (!process.env.APPWRITE_PROJECT_ID) {
    throw new Error('APPWRITE_PROJECT_ID secret is not defined in environment variables');
}
if (!process.env.APPWRITE_ENDPOINT) {
    throw new Error('APPWRITE_ENDPOINT is not defined in environment variables');
}
exports.client = new appwrite_1.Client()
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setEndpoint(process.env.APPWRITE_ENDPOINT);
exports.account = new appwrite_1.Account(exports.client);
//# sourceMappingURL=appwrite.js.map