"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-console */
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../app"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const users_models_1 = __importDefault(require("../models/users.models"));
const user_dao_1 = require("../dao/user.dao");
jest.mock('../../utils/appwrite.ts', () => ({
    client: {},
}));
console.log('MONGODB_TEST_URI exists?', !!process.env.MONGODB_TEST_URI);
console.log('JWT_SECRET exists?', !!process.env.JWT_SECRET);
let seededAdmin;
beforeAll(async () => {
    if (!process.env.MONGODB_TEST_URI) {
        throw new Error('MONGODB_TEST_URI environment variable is required');
    }
    try {
        await mongoose_1.default.connect(process.env.MONGODB_TEST_URI);
        console.log('MongoDB connected');
    }
    catch (err) {
        console.error('MongoDB connection failed:', err);
    }
    await mongoose_1.default.connection.collection('users').deleteMany({});
    // υπήρχε το εξής προβλημα. Για να φτιάξεις έναν admin επρεπε να ήταν ήδη logedin κάποιος admin, προσπάθησα να κάνω mock το middleware αλλα δεν έβγενε ακρη και για αυτο ξεκινάμε με μια βάση δεδομένον που δεν έιναι κενή αλλά έχει ήδη έναν αντμιν μεσα
    // seed initial db with admin user
    const plainPassword = 'Passw0rd!';
    const hashedPassword = await bcrypt_1.default.hash(plainPassword, 10);
    seededAdmin = await users_models_1.default.create({
        username: 'admin1',
        hashedPassword,
        roles: ['ADMIN'],
        email: 'admin@example.com',
        name: 'Admin User',
    });
    seededAdmin.passwordPlain = plainPassword; // store plain pw for login later
    console.log('MongoDB connected:', mongoose_1.default.connection.readyState);
    console.log('Seeded admin:', seededAdmin.username, seededAdmin.hashedPassword);
});
// beforeEach(async () => {
//   await mongoose.connection.collection("users").deleteMany({});
// });
afterAll(async () => {
    await mongoose_1.default.connection.collection('users').deleteMany({});
    await mongoose_1.default.disconnect();
});
describe('POST /api/users/signup/user', () => {
    it('should create a new user with valid data', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/users/signup/user')
            .send({
            username: 'testuser',
            password: 'Passw0rd!',
            name: 'Test User',
            email: 'test@example.com',
        });
        expect(res.status).toBe(201);
        expect(res.body.data.username).toBe('testuser');
        // Ensure password is hashed in DB
        const savedUser = await users_models_1.default.findOne({ username: 'testuser' });
        expect(savedUser).not.toBeNull();
        expect(savedUser?.hashedPassword).not.toBe('Passw0rd!');
    });
    it('should fail if username already exists', async () => {
        await users_models_1.default.create({
            username: 'duplicate',
            hashedPassword: 'hashedpass',
            name: 'Existing',
            email: 'exist@example.com',
            roles: ['USER'],
        });
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/users/signup/user')
            .send({
            username: 'duplicate',
            password: 'Passw0rd!',
        });
        expect(res.status).toBe(409);
        expect(res.body.status).toBe(false);
        expect(res.body.error).toMatch(/username/i);
    });
    it('should fail if email already exists', async () => {
        await users_models_1.default.create({
            username: 'user1',
            hashedPassword: 'hashedpass',
            name: 'Existing',
            email: 'usermail@example.com',
            roles: ['USER'],
        });
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/users/signup/user')
            .send({
            username: 'newuser',
            password: 'Passw0rd!',
            email: 'exist@example.com',
        });
        expect(res.status).toBe(409);
        expect(res.body.status).toBe(false);
        expect(res.body.error).toMatch(/email/i);
    });
    it('should fail if password does not meet requirements', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/users/signup/user')
            .send({
            username: 'weakpass',
            password: 'abc',
        });
        expect(res.status).toBe(400); // zod validation error
        expect(res.body).toHaveProperty('status', false);
    });
    it('should return 500 if DAO.create throws unexpected error', async () => {
        jest.spyOn(user_dao_1.userDAO, 'create').mockImplementationOnce(() => {
            throw new Error('Simulated DAO failure');
        });
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/users/signup/user')
            .send({
            username: 'anotheruser',
            password: 'Passw0rd!',
            name: 'Another User',
            email: 'another@example.com',
        });
        expect(res.status).toBe(500);
        expect(res.body.status).toBe(false);
        expect(res.body.error).toMatch(/Simulated DAO failure/i);
    });
    it('should return 500 if bcrypt.hash throws unexpected error', async () => {
        jest.spyOn(bcrypt_1.default, 'hash').mockImplementationOnce(() => {
            throw new Error('Hashing failed');
        });
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/users/signup/user')
            .send({
            username: 'userhashfail',
            password: 'Passw0rd!',
            name: 'User Fail',
            email: 'userfail@example.com',
        });
        expect(res.status).toBe(500);
        expect(res.body.status).toBe(false);
        expect(res.body.error).toMatch(/Hashing failed/i);
    });
    it('should return 400 if request body is totally malformed', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/users/signup/user')
            .send({ foo: 'bar' }); // missing required fields
        expect(res.status).toBe(400);
        expect(res.body.status).toBe(false);
        expect(res.body.errors).toBeDefined();
    });
});
describe('POST /api/users/signup/admin', () => {
    let adminToken;
    beforeAll(async () => {
        // Login with seeded admin to get token
        const loginRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth')
            .send({
            username: 'admin1',
            password: 'Passw0rd!',
        });
        expect(loginRes.status).toBe(200);
        adminToken = loginRes.body.data.token;
        console.log('\x1b[31m%s\x1b[0m', '***Admin token***:', adminToken);
    });
    it('should create a new admin when authorized', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/users/signup/admin')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            username: 'admin2',
            password: 'StrongPass1!',
            name: 'Second Admin',
            email: 'admin2@example.com',
            roles: ['ADMIN'],
        });
        expect(res.status).toBe(201);
        expect(res.body.data.roles).toContain('ADMIN');
        const dbUser = await users_models_1.default.findOne({ username: 'admin2' });
        expect(dbUser).not.toBeNull();
        expect(dbUser?.hashedPassword).not.toBe('StrongPass1!');
    });
    it('should fail if username already exists', async () => {
        // Δημιουργία χρήστη με username "existingAdmin"
        await users_models_1.default.create({
            username: 'existingAdmin',
            hashedPassword: 'hashedpass',
            name: 'Existing Admin',
            email: 'existing@example.com',
            roles: ['ADMIN'],
        });
        // Login με seeded admin για να πάρεις token
        const loginRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth')
            .send({
            username: 'admin1', // seeded admin username
            password: 'Passw0rd!', // seeded admin plain password
        });
        expect(loginRes.status).toBe(200);
        const adminToken = loginRes.body.data.token;
        // Κλήση για δημιουργία admin με ήδη υπάρχον username, στέλνοντας το token
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/users/signup/admin')
            .set('Authorization', `Bearer ${adminToken}`) // Βάλε το token στο header
            .send({
            username: 'existingAdmin',
            password: 'Passw0rd!',
        });
        expect(res.status).toBe(409);
        expect(res.body.status).toBe(false);
        expect(res.body.error).toMatch(/username/i);
    });
    it('should fail if email already exists', async () => {
        // Δημιουργούμε admin με το email που θα δοκιμάσουμε να επαναλάβουμε
        await users_models_1.default.create({
            username: 'otheradmin',
            hashedPassword: 'hashedpass',
            name: 'Other Admin',
            email: 'taken@example.com',
            roles: ['ADMIN'],
        });
        // Κάνουμε login με τον seeded admin για να πάρουμε token
        const loginRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth')
            .send({
            username: 'admin1', // seeded admin username
            password: 'Passw0rd!', // seeded admin plain password
        });
        expect(loginRes.status).toBe(200);
        const adminToken = loginRes.body.data.token;
        // Στέλνουμε το request με το token και email που ήδη υπάρχει
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/users/signup/admin')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            username: 'newadmin',
            password: 'Passw0rd!',
            email: 'taken@example.com',
        });
        expect(res.status).toBe(409);
        expect(res.body.status).toBe(false);
        expect(res.body.error).toMatch(/email/i);
    });
    it('should fail if password is too weak', async () => {
        // login admin για token
        const loginRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth')
            .send({ username: 'admin1', password: 'Passw0rd!' });
        expect(loginRes.status).toBe(200);
        const adminToken = loginRes.body.data.token;
        // στέλνουμε το token στο request
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/users/signup/admin')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            username: 'weakadmin',
            password: 'abc',
        });
        expect(res.status).toBe(400); // zod validation error
        expect(res.body.status).toBe(false);
        expect(res.body.errors).toBeDefined();
    });
    it('should fail if required fields are missing', async () => {
        // login admin για token
        const loginRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth')
            .send({ username: 'admin1', password: 'Passw0rd!' });
        expect(loginRes.status).toBe(200);
        const adminToken = loginRes.body.data.token;
        // στέλνουμε το token στο request
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/users/signup/admin')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            username: '',
            password: '',
        });
        expect(res.status).toBe(400);
        expect(res.body.status).toBe(false);
    });
    it('should create a new admin when no email is provided (covers `if(email)` false)', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/users/signup/admin')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            username: 'adminNoEmail',
            password: 'StrongPass1!',
            name: 'No Email Admin',
            roles: ['ADMIN'],
        });
        expect(res.status).toBe(201);
        expect(res.body.data.username).toBe('adminNoEmail');
        expect(res.body.data.email).toBe(''); // default empty string
        const dbUser = await users_models_1.default.findOne({ username: 'adminNoEmail' });
        expect(dbUser).not.toBeNull();
        expect(dbUser?.email).toBe('');
    });
    it('should hit catch block if request body is totally malformed', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/users/signup/admin')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ foo: 'bar' }); // missing required fields, will throw in Zod parse
        expect(res.status).toBe(400);
        expect(res.body.status).toBe(false);
        expect(res.body.errors).toBeDefined();
    });
});
describe('Protected User API routes with real middleware and login', () => {
    let adminToken;
    let userToken;
    let normalUserId;
    beforeAll(async () => {
        // Login with seeded admin to get token
        const loginRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth')
            .send({
            username: 'admin1',
            password: 'Passw0rd!',
        });
        expect(loginRes.status).toBe(200);
        adminToken = loginRes.body.data.token;
        // Create and login a normal user to test update own profile
        const userRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/users/signup/user')
            .send({
            username: 'normaluser',
            password: 'Passw0rd!',
            email: 'normaluser@example.com',
        });
        expect(userRes.status).toBe(201);
        normalUserId = userRes.body.data.id || userRes.body.data._id; // check your actual response
        const loginUserRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth')
            .send({ username: 'normaluser', password: 'Passw0rd!' });
        expect(loginUserRes.status).toBe(200);
        userToken = loginUserRes.body.data.token;
    });
    describe('POST /api/auth/refresh', () => {
        it('should refresh token for valid user', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/refresh')
                .set('Authorization', `Bearer ${userToken}`);
            expect(res.status).toBe(200);
            expect(res.body.status).toBe(true);
            expect(res.body.data.token).toBeDefined();
            expect(res.body.data.token).not.toBe(userToken); // should return a new token
        });
        it('should return 401 if no token is provided', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/refresh');
            expect(res.status).toBe(401);
            expect(res.body.status).toBe(false);
            expect(res.body.error).toBe('No token provided');
        });
        it('should return 401 if token is invalid', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/refresh')
                .set('Authorization', 'Bearer invalidtoken123');
            expect(res.status).toBe(401);
            expect(res.body.status).toBe(false);
            expect(res.body.error).toBe('Invalid token');
        });
    });
    it('GET /api/users should require auth and return all users', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .get('/api/users')
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });
    it('GET /api/users/:id should return user by ID', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .get(`/api/users/${seededAdmin._id}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(res.body.data.username).toBe(seededAdmin.username);
    });
    it('GET /api/users/username/:username should return user by username', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .get(`/api/users/username/${seededAdmin.username}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(res.body.data.id).toBe(String(seededAdmin._id));
    });
    it('should return 401 if no token is provided', async () => {
        const res = await (0, supertest_1.default)(app_1.default).get('/api/users');
        expect(res.status).toBe(401);
    });
    it('should return 403 if user does not have ADMIN role', async () => {
        // Create a user without ADMIN role and get token for it
        const userRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/users/signup/user')
            .send({
            username: 'normaluser2',
            password: 'Passw0rd!',
            email: 'normaluser2@example.com'
        });
        expect(userRes.status).toBe(201);
        const loginRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth')
            .send({
            username: 'normaluser',
            password: 'Passw0rd!',
        });
        expect(loginRes.status).toBe(200);
        const userToken = loginRes.body.data.token;
        const res = await (0, supertest_1.default)(app_1.default)
            .get('/api/users')
            .set('Authorization', `Bearer ${userToken}`);
        expect(res.status).toBe(403);
    });
    it('GET /api/users/email/:email should return user by email', async () => {
        // Using seeded admin's email
        const res = await (0, supertest_1.default)(app_1.default)
            .get(`/api/users/email/${seededAdmin.email}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
        expect(res.body.data._id).toBe(String(seededAdmin._id));
        expect(res.body.data.username).toBe(seededAdmin.username);
        expect(res.body.data.email).toBe(seededAdmin.email);
    });
    it('GET /api/users/email/:email should return 404 if user not found', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .get('/api/users/email/nonexistent@example.com')
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(404);
        expect(res.body.status).toBe(false);
        expect(res.body.message).toBe('User not found');
    });
    describe('PUT /api/users/:id - update user', () => {
        it('should allow admin to update any user', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .put(`/api/users/${normalUserId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: 'Updated Name by Admin' });
            expect(res.status).toBe(200);
            expect(res.body.status).toBe(true);
            expect(res.body.data.name).toBe('Updated Name by Admin');
        });
        it('should allow user to update own profile', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .put(`/api/users/${normalUserId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ name: 'Updated Name by User' });
            expect(res.status).toBe(200);
            expect(res.body.status).toBe(true);
            expect(res.body.data.name).toBe('Updated Name by User');
        });
        it('should forbid user to update another user\'s profile', async () => {
            // normaluser tries to update admin's profile
            const res = await (0, supertest_1.default)(app_1.default)
                .put(`/api/users/${seededAdmin._id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ name: 'Hacker Name' });
            expect(res.status).toBe(403);
            expect(res.body.status).toBe(false);
            expect(res.body.error).toMatch(/forbidden/i);
        });
        it('should return 400 if invalid data sent', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .put(`/api/users/${normalUserId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ username: '' }); // invalid username
            expect(res.status).toBe(400);
            expect(res.body.status).toBe(false);
            expect(Array.isArray(res.body.errors)).toBe(true);
        });
        it('should return 401 if no token provided', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .put(`/api/users/${normalUserId}`)
                .send({ name: 'No Token' });
            expect(res.status).toBe(401);
            expect(res.body.status).toBe(false);
        });
        describe('PUT /api/users/toggle-admin/:id - toggle admin role', () => {
            let normalUserId;
            beforeAll(async () => {
                // Create a normal user if not already created
                const userRes = await (0, supertest_1.default)(app_1.default)
                    .post('/api/users/signup/user')
                    .send({
                    username: 'toggleuser',
                    password: 'Passw0rd!',
                    email: 'toggleuser@example.com',
                });
                normalUserId = userRes.body.data._id || userRes.body.data.id;
            });
            it('should allow admin to make a user an admin', async () => {
                const res = await (0, supertest_1.default)(app_1.default)
                    .put(`/api/users/toggle-admin/${normalUserId}`)
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send();
                expect(res.status).toBe(200);
                expect(res.body.status).toBe(true);
                expect(res.body.data.roles).toContain('ADMIN');
            });
            it('should allow admin to remove admin role from a user', async () => {
                // toggle back
                const res = await (0, supertest_1.default)(app_1.default)
                    .put(`/api/users/toggle-admin/${normalUserId}`)
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send();
                expect(res.status).toBe(200);
                expect(res.body.status).toBe(true);
                expect(res.body.data.roles).toContain('USER');
                expect(res.body.data.roles).not.toContain('ADMIN');
            });
            it('should forbid non-admin users', async () => {
                const res = await (0, supertest_1.default)(app_1.default)
                    .put(`/api/users/toggle-admin/${normalUserId}`)
                    .set('Authorization', `Bearer ${userToken}`)
                    .send();
                expect(res.status).toBe(403);
                expect(res.body.status).toBe(false);
            });
            it('should not allow admin to remove own admin role', async () => {
                const res = await (0, supertest_1.default)(app_1.default)
                    .put(`/api/users/toggle-admin/${seededAdmin._id}`)
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send();
                expect(res.status).toBe(400);
                expect(res.body.status).toBe(false);
                expect(res.body.error).toMatch(/cannot remove your own admin/i);
            });
            it('should return 404 if user does not exist', async () => {
                const fakeId = new mongoose_1.default.Types.ObjectId();
                const res = await (0, supertest_1.default)(app_1.default)
                    .put(`/api/users/toggle-admin/${fakeId}`)
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send();
                expect(res.status).toBe(404);
                expect(res.body.status).toBe(false);
                expect(res.body.error).toMatch(/user not found/i);
            });
            it('should return 401 if no token provided', async () => {
                const res = await (0, supertest_1.default)(app_1.default)
                    .put(`/api/users/toggle-admin/${normalUserId}`)
                    .send();
                expect(res.status).toBe(401);
                expect(res.body.status).toBe(false);
            });
        });
        //added tests
        it('should hash password if provided', async () => {
            const newPassword = 'NewPass123!';
            const res = await (0, supertest_1.default)(app_1.default)
                .put(`/api/users/${normalUserId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ password: newPassword });
            expect(res.status).toBe(200);
            expect(res.body.status).toBe(true);
            expect(res.body.data.hashedPassword).not.toBe(newPassword);
            // Ensure user can login with new password
            const loginRes = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth')
                .send({ username: 'normaluser', password: newPassword });
            expect(loginRes.status).toBe(200);
            expect(loginRes.body.data.token).toBeDefined();
        });
        it('should return 409 if username already exists for another user', async () => {
            // Create a second user to conflict with
            const conflictRes = await (0, supertest_1.default)(app_1.default)
                .post('/api/users/signup/user')
                .send({
                username: 'conflictuser',
                password: 'Passw0rd!',
                email: 'conflict@example.com'
            });
            expect(conflictRes.status).toBe(201);
            // Attempt to update normaluser's username to "conflictuser"
            const res = await (0, supertest_1.default)(app_1.default)
                .put(`/api/users/${normalUserId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ username: 'conflictuser' });
            expect(res.status).toBe(409);
            expect(res.body.status).toBe(false);
            expect(res.body.error).toMatch(/username already taken/i);
        });
        it('should hit catch block if DAO throws unexpected error', async () => {
            // Temporarily replace DAO.update with a failing version
            const originalUpdate = user_dao_1.userDAO.update;
            user_dao_1.userDAO.update = async () => { throw new Error('Simulated DAO failure'); };
            const res = await (0, supertest_1.default)(app_1.default)
                .put(`/api/users/${normalUserId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ name: 'Trigger Error' });
            expect(res.status).toBe(500);
            expect(res.body.status).toBe(false);
            expect(res.body.error).toMatch(/Simulated DAO failure/i);
            // Restore original DAO.update
            user_dao_1.userDAO.update = originalUpdate;
        });
    });
    describe('DELETE /api/users/:id - delete user', () => {
        let userToDeleteId;
        beforeAll(async () => {
            // Create a user to delete
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/users/signup/user')
                .send({
                username: 'tobedeleted',
                password: 'Passw0rd!',
                email: 'delete@example.com',
            });
            userToDeleteId = res.body.data.id || res.body.data._id;
        });
        it('should forbid delete without token', async () => {
            const res = await (0, supertest_1.default)(app_1.default).delete(`/api/users/${userToDeleteId}`);
            expect(res.status).toBe(401);
            expect(res.body.status).toBe(false);
        });
        it('should forbid delete if user is not admin', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .delete(`/api/users/${userToDeleteId}`)
                .set('Authorization', `Bearer ${userToken}`);
            expect(res.status).toBe(403);
        });
        it('should allow admin to delete a user', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .delete(`/api/users/${userToDeleteId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(200);
            expect(res.body.status).toBe(true);
            expect(res.body.message).toMatch(/deleted successfully/i);
        });
        it('should return 404 when deleting non-existent user', async () => {
            const fakeId = new mongoose_1.default.Types.ObjectId().toString();
            const res = await (0, supertest_1.default)(app_1.default)
                .delete(`/api/users/${fakeId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(404);
            expect(res.body.status).toBe(false);
            expect(res.body.error).toMatch(/does not exist/i);
        });
        // additional tests
        it('should return 500 if DAO.deleteById throws an error', async () => {
            // Temporarily replace DAO with one that throws
            const originalDelete = user_dao_1.userDAO.deleteById;
            user_dao_1.userDAO.deleteById = jest.fn().mockImplementationOnce(() => {
                throw new Error('Simulated DAO error');
            });
            const res = await (0, supertest_1.default)(app_1.default)
                .delete(`/api/users/${userToDeleteId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(500);
            expect(res.body.status).toBe(false);
            expect(res.body.error).toMatch(/Simulated DAO error/i);
            // restore DAO
            user_dao_1.userDAO.deleteById = originalDelete;
        });
    });
});
//cover uncoverd
describe('GET /api/users error handling', () => {
    let adminToken;
    beforeAll(async () => {
        // Login admin and get token (reuse your existing code)
        const loginRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth')
            .send({ username: 'admin1', password: 'Passw0rd!' });
        adminToken = loginRes.body.data.token;
    });
    it('should return 500 if userDAO.readAll throws an error', async () => {
        // Mock readAll to throw
        jest.spyOn(user_dao_1.userDAO, 'readAll').mockImplementationOnce(() => {
            throw new Error('Simulated DAO failure');
        });
        const res = await (0, supertest_1.default)(app_1.default)
            .get('/api/users')
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(500);
        expect(res.body.status).toBe(false);
        expect(res.body.error).toBe('Simulated DAO failure');
        // Restore original implementation after test (optional if test isolated)
        user_dao_1.userDAO.readAll.mockRestore();
    });
    it('should return 401 if no auth header', async () => {
        const res = await (0, supertest_1.default)(app_1.default).get('/api/users');
        expect(res.status).toBe(401);
        expect(res.body.status).toBe(false);
    });
    it('should return 409 if username already exists when creating admin', async () => {
        // First, create an admin
        await (0, supertest_1.default)(app_1.default)
            .post('/api/users/signup/admin')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            username: 'existingadmin',
            password: 'Passw0rd!',
            email: 'existingadmin@example.com',
            roles: ['ADMIN'],
        });
        // Try to create again with same username
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/users/signup/admin')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            username: 'existingadmin',
            password: 'Passw0rd!',
            email: 'another@example.com',
            roles: ['ADMIN'],
        });
        expect(res.status).toBe(409);
        expect(res.body.status).toBe(false);
        expect(res.body.error).toMatch(/username already taken/i);
    });
    it('should return 409 if email already exists when creating admin', async () => {
        // First, create an admin
        await (0, supertest_1.default)(app_1.default)
            .post('/api/users/signup/admin')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            username: 'adminemail',
            password: 'Passw0rd!',
            email: 'adminemail@example.com',
            roles: ['ADMIN'],
        });
        // Try to create again with same email
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/users/signup/admin')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            username: 'anotherusername',
            password: 'Passw0rd!',
            email: 'adminemail@example.com',
            roles: ['ADMIN'],
        });
        expect(res.status).toBe(409);
        expect(res.body.status).toBe(false);
        expect(res.body.error).toMatch(/email already taken/i);
    });
});
//# sourceMappingURL=user.test.js.map