"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const supertest_1 = __importDefault(require("supertest"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = __importDefault(require("../../app"));
const upload_model_1 = __importDefault(require("../upload.model"));
const users_models_1 = __importDefault(require("../../login/models/users.models"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
if (!process.env.MONGODB_TEST_URI) {
    throw new Error('MONGODB_TEST_URI is required');
}
if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required');
}
let adminToken;
beforeAll(async () => {
    await (0, mongoose_1.connect)(process.env.MONGODB_TEST_URI);
    await upload_model_1.default.deleteMany({});
    await users_models_1.default.deleteMany({});
    // seed admin user
    const plainPassword = 'Passw0rd!';
    const hashedPassword = await bcrypt_1.default.hash(plainPassword, 10);
    const admin = await users_models_1.default.create({
        username: 'admin1',
        hashedPassword,
        roles: ['ADMIN'],
        email: 'admin@example.com',
        name: 'Admin User',
    });
    // sign JWT manually (middleware only checks validity & role)
    adminToken = jsonwebtoken_1.default.sign({
        id: admin._id.toString(),
        username: admin.username,
        email: admin.email,
        roles: admin.roles,
    }, process.env.JWT_SECRET, { expiresIn: '1h' });
});
afterAll(async () => {
    await upload_model_1.default.deleteMany({});
    await users_models_1.default.deleteMany({});
    await (0, mongoose_1.disconnect)();
});
describe('POST /api/upload-multer', () => {
    const imagePath = path_1.default.join(__dirname, 'test-assets', 'dummy.jpg');
    it('should upload file without saving to Mongo', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/upload-multer?saveToMongo=false')
            .set('Authorization', `Bearer ${adminToken}`)
            .attach('image', imagePath)
            .field('name', 'NoMongo')
            .field('desc', 'Just disk');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
        expect(res.body.data.file.url).toContain('/uploads/');
    });
    it('should upload file and save to Mongo', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/upload-multer?saveToMongo=true')
            .set('Authorization', `Bearer ${adminToken}`)
            .attach('image', imagePath)
            .field('name', 'WithMongo')
            .field('desc', 'Stored in db');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
        const found = await upload_model_1.default.findOne({ name: 'WithMongo' });
        expect(found).not.toBeNull();
        expect(found?.file.originalName).toBe('dummy.jpg');
    });
    it('should return 400 if no file provided', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/upload-multer?saveToMongo=true')
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(400);
    });
});
const upload_dao_1 = __importDefault(require("../upload.dao"));
describe('uploadFile controller error handling', () => {
    it('should return 500 if uploadDao.createUpload throws', async () => {
        const spy = jest
            .spyOn(upload_dao_1.default, 'createUpload')
            .mockRejectedValueOnce(new Error('DB fail'));
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/upload-multer?saveToMongo=true')
            .set('Authorization', `Bearer ${adminToken}`)
            .attach('image', Buffer.from('fake'), 'test.jpg')
            .field('name', 'bad')
            .field('desc', 'force error');
        expect(res.status).toBe(500);
        expect(res.body.status).toBe(false);
        expect(res.body.error).toBe('DB fail'); // ✅ match handler shape
        spy.mockRestore();
    });
});
//# sourceMappingURL=multer.postHome.test.js.map