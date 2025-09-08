"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const supertest_1 = __importDefault(require("supertest"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = __importDefault(require("../../app"));
const upload_model_1 = __importDefault(require("../upload.model"));
const upload_dao_1 = __importDefault(require("../upload.dao"));
if (!process.env.MONGODB_TEST_URI) {
    throw new Error('MONGODB_TEST_URI is required');
}
beforeAll(async () => {
    await (0, mongoose_1.connect)(process.env.MONGODB_TEST_URI);
    await upload_model_1.default.deleteMany({});
});
afterAll(async () => {
    await upload_model_1.default.deleteMany({});
    await (0, mongoose_1.disconnect)();
});
describe('GET /api/upload-multer', () => {
    it('should return empty array when no uploads', async () => {
        const res = await (0, supertest_1.default)(app_1.default).get('/api/upload-multer');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBe(0);
    });
    it('should return uploads when documents exist', async () => {
        const saved = await upload_model_1.default.create({
            name: 'Test file',
            desc: 'desc',
            file: {
                data: Buffer.from('dummy'),
                contentType: 'image/png',
                originalName: 'dummy.png',
                filename: 'dummy.png',
            },
        });
        const res = await (0, supertest_1.default)(app_1.default).get('/api/upload-multer');
        expect(res.status).toBe(200);
        expect(res.body.data.length).toBeGreaterThan(0);
        expect(res.body.data[0]._id).toBe(saved._id.toString());
    });
    it('should return 500 if DAO throws error', async () => {
        const spy = jest.spyOn(upload_dao_1.default, 'getAllUploads').mockRejectedValueOnce(new Error('DB fail'));
        const res = await (0, supertest_1.default)(app_1.default).get('/api/upload-multer');
        expect(res.status).toBe(500);
        spy.mockRestore();
    });
});
const errorHnadler_1 = require("../../utils/errorHnadler");
describe('handleControllerError utility', () => {
    it('should return 500 with Unknown error if error is not instance of Error', () => {
        // mock Response
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        // act
        (0, errorHnadler_1.handleControllerError)(res, 'not-an-error');
        // assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            status: false,
            error: 'Unknown error',
        });
    });
    it('should return 500 with Unknown error if error is not instance of Error', () => {
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        (0, errorHnadler_1.handleControllerError)(res, 'not-an-error');
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            status: false,
            error: 'Unknown error',
        });
    });
});
//# sourceMappingURL=multer.getHome.test.js.map