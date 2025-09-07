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
const upload_dao_1 = __importDefault(require("../upload.dao"));
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
describe('DELETE /api/upload-multer/:id', () => {
    const imagePath = path_1.default.join(__dirname, 'test-assets', 'dummy.jpg');
    let uploadId;
    beforeEach(async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/upload-multer?saveToMongo=true')
            .set('Authorization', `Bearer ${adminToken}`)
            .attach('image', imagePath)
            .field('name', 'DeleteMe')
            .field('desc', 'to be deleted');
        uploadId = res.body.data.file.filename ? (await upload_model_1.default.findOne({ name: 'DeleteMe' }))._id.toString() : '';
    });
    it('should delete an upload successfully', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .delete(`/api/upload-multer/${uploadId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        ;
        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/deleted/i);
        const deleted = await upload_model_1.default.findById(uploadId);
        expect(deleted).toBeNull();
    });
    it('should return 404 if file not found', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .delete('/api/upload-multer/507f1f77bcf86cd799439011')
            .set('Authorization', `Bearer ${adminToken}`);
        ;
        expect(res.status).toBe(404);
    });
    it('should return 500 if DAO throws error', async () => {
        const spy = jest.spyOn(upload_dao_1.default, 'deleteUpload').mockRejectedValueOnce(new Error('DB fail'));
        const res = await (0, supertest_1.default)(app_1.default)
            .delete(`/api/upload-multer/${uploadId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        ;
        expect(res.status).toBe(500);
        spy.mockRestore();
    });
});
//# sourceMappingURL=multer.deleteHome.test.js.map