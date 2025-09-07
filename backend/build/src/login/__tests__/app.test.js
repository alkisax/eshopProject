"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
process.env.APPWRITE_PROJECT_ID = 'fake';
process.env.APPWRITE_ENDPOINT = 'http://fake';
process.env.APPWRITE_API_KEY = 'fake-key';
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../app"));
describe('App routes', () => {
    it('should respond to /api/ping', async () => {
        const res = await (0, supertest_1.default)(app_1.default).get('/api/ping');
        expect(res.status).toBe(200);
        expect(res.text).toBe('pong');
    });
    it('should respond to /health', async () => {
        const res = await (0, supertest_1.default)(app_1.default).get('/health');
        expect(res.status).toBe(200);
        expect(res.text).toBe('ok');
    });
});
//# sourceMappingURL=app.test.js.map