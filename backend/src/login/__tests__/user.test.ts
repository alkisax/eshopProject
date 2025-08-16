/* eslint-disable no-console */
import mongoose, { Types } from 'mongoose';
import request from 'supertest';
import dotenv from 'dotenv';
import app from '../../app';
import bcrypt from 'bcrypt';
import User from '../models/users.models';
import { userDAO } from '../dao/user.dao';

jest.mock('../../utils/appwrite.ts', () => ({
  client: {},
}));

dotenv.config();

interface AdminUser {
    _id: Types.ObjectId;
    username: string,
    hashedPassword: string,
    roles: string[],
    email: string,
    name: string,
    passwordPlain?: string
}

let seededAdmin: AdminUser;

beforeAll(async () => {
  if (!process.env.MONGODB_TEST_URI) {
    throw new Error('MONGODB_TEST_URI environment variable is required');
  }
  await mongoose.connect(process.env.MONGODB_TEST_URI);
  await mongoose.connection.collection('users').deleteMany({});

  // υπήρχε το εξής προβλημα. Για να φτιάξεις έναν admin επρεπε να ήταν ήδη logedin κάποιος admin, προσπάθησα να κάνω mock το middleware αλλα δεν έβγενε ακρη και για αυτο ξεκινάμε με μια βάση δεδομένον που δεν έιναι κενή αλλά έχει ήδη έναν αντμιν μεσα
  // seed initial db with admin user
  const plainPassword = 'Passw0rd!';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  seededAdmin = await User.create({
    username: 'admin1',
    hashedPassword,
    roles: ['ADMIN'],
    email: 'admin@example.com',
    name: 'Admin User',
  }) as AdminUser;

  seededAdmin.passwordPlain = plainPassword; // store plain pw for login later
  console.log('MongoDB connected:', mongoose.connection.readyState);
  console.log('Seeded admin:', seededAdmin.username, seededAdmin.hashedPassword);
});

// beforeEach(async () => {
//   await mongoose.connection.collection("users").deleteMany({});
// });

afterAll(async () => {
  await mongoose.connection.collection('users').deleteMany({});
  await mongoose.disconnect();
});

describe('POST /api/users/signup/user', () => {
  it('should create a new user with valid data', async () => {
    const res = await request(app)
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
    const savedUser = await User.findOne({ username: 'testuser' });
    expect(savedUser).not.toBeNull();
    expect(savedUser?.hashedPassword).not.toBe('Passw0rd!');
  });

  it('should fail if username already exists', async () => {
    await User.create({
      username: 'duplicate',
      hashedPassword: 'hashedpass',
      name: 'Existing',
      email: 'exist@example.com',
      roles: ['USER'],
    });

    const res = await request(app)
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
    await User.create({
      username: 'user1',
      hashedPassword: 'hashedpass',
      name: 'Existing',
      email: 'usermail@example.com',
      roles: ['USER'],
    });

    const res = await request(app)
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
    const res = await request(app)
      .post('/api/users/signup/user')
      .send({
        username: 'weakpass',
        password: 'abc',
      });

    expect(res.status).toBe(400); // zod validation error
    expect(res.body).toHaveProperty('status', false);
  });

  it('should return 500 if DAO.create throws unexpected error', async () => {
    jest.spyOn(userDAO, 'create').mockImplementationOnce(() => {
      throw new Error('Simulated DAO failure');
    });

    const res = await request(app)
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
    jest.spyOn(bcrypt, 'hash').mockImplementationOnce(() => {
      throw new Error('Hashing failed');
    });

    const res = await request(app)
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
    const res = await request(app)
      .post('/api/users/signup/user')
      .send({ foo: 'bar' }); // missing required fields

    expect(res.status).toBe(400);
    expect(res.body.status).toBe(false);
    expect(res.body.errors).toBeDefined();
  });
});


describe('POST /api/users/signup/admin', () => {
  let adminToken: string;
  beforeAll(async () => {
    // Login with seeded admin to get token
    const loginRes = await request(app)
      .post('/api/auth')
      .send({
        username: 'admin1',
        password: 'Passw0rd!',
      });

    expect(loginRes.status).toBe(200);
    adminToken = loginRes.body.data.token;
  });


  it('should create a new admin when authorized', async () => {
    const res = await request(app)
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

    const dbUser = await User.findOne({ username: 'admin2' });
    expect(dbUser).not.toBeNull();
    expect(dbUser?.hashedPassword).not.toBe('StrongPass1!');
  });

  it('should fail if username already exists', async () => {
    // Δημιουργία χρήστη με username "existingAdmin"
    await User.create({
      username: 'existingAdmin',
      hashedPassword: 'hashedpass',
      name: 'Existing Admin',
      email: 'existing@example.com',
      roles: ['ADMIN'],
    });

    // Login με seeded admin για να πάρεις token
    const loginRes = await request(app)
      .post('/api/auth')
      .send({
        username: 'admin1',       // seeded admin username
        password: 'Passw0rd!',    // seeded admin plain password
      });

    expect(loginRes.status).toBe(200);
    const adminToken = loginRes.body.data.token;

    // Κλήση για δημιουργία admin με ήδη υπάρχον username, στέλνοντας το token
    const res = await request(app)
      .post('/api/users/signup/admin')
      .set('Authorization', `Bearer ${adminToken}`)   // Βάλε το token στο header
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
    await User.create({
      username: 'otheradmin',
      hashedPassword: 'hashedpass',
      name: 'Other Admin',
      email: 'taken@example.com',
      roles: ['ADMIN'],
    });

    // Κάνουμε login με τον seeded admin για να πάρουμε token
    const loginRes = await request(app)
      .post('/api/auth')
      .send({
        username: 'admin1',       // seeded admin username
        password: 'Passw0rd!',    // seeded admin plain password
      });

    expect(loginRes.status).toBe(200);
    const adminToken = loginRes.body.data.token;

    // Στέλνουμε το request με το token και email που ήδη υπάρχει
    const res = await request(app)
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
    const loginRes = await request(app)
      .post('/api/auth')
      .send({ username: 'admin1', password: 'Passw0rd!' });
    
    expect(loginRes.status).toBe(200);
    const adminToken = loginRes.body.data.token;

    // στέλνουμε το token στο request
    const res = await request(app)
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
    const loginRes = await request(app)
      .post('/api/auth')
      .send({ username: 'admin1', password: 'Passw0rd!' });
    
    expect(loginRes.status).toBe(200);
    const adminToken = loginRes.body.data.token;

    // στέλνουμε το token στο request
    const res = await request(app)
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
    const res = await request(app)
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

    const dbUser = await User.findOne({ username: 'adminNoEmail' });
    expect(dbUser).not.toBeNull();
    expect(dbUser?.email).toBe('');
  });

  it('should hit catch block if request body is totally malformed', async () => {
    const res = await request(app)
      .post('/api/users/signup/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ foo: 'bar' }); // missing required fields, will throw in Zod parse

    expect(res.status).toBe(400);
    expect(res.body.status).toBe(false);
    expect(res.body.errors).toBeDefined();
  });
});


describe('Protected User API routes with real middleware and login', () => {
  let adminToken: string;
  let userToken: string;
  let normalUserId: string;

  beforeAll(async () => {
    // Login with seeded admin to get token
    const loginRes = await request(app)
      .post('/api/auth')
      .send({
        username: 'admin1',
        password: 'Passw0rd!',
      });

    expect(loginRes.status).toBe(200);
    adminToken = loginRes.body.data.token;

    // Create and login a normal user to test update own profile
    const userRes = await request(app)
      .post('/api/users/signup/user')
      .send({
        username: 'normaluser',
        password: 'Passw0rd!',
        email: 'normaluser@example.com',
      });
    expect(userRes.status).toBe(201);
    normalUserId = userRes.body.data.id || userRes.body.data._id; // check your actual response

    const loginUserRes = await request(app)
      .post('/api/auth')
      .send({ username: 'normaluser', password: 'Passw0rd!' });
    expect(loginUserRes.status).toBe(200);
    userToken = loginUserRes.body.data.token;
  });

  it('GET /api/users should require auth and return all users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/users/:id should return user by ID', async () => {
    const res = await request(app)
      .get(`/api/users/${seededAdmin._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.username).toBe(seededAdmin.username);
  });

  it('GET /api/users/username/:username should return user by username', async () => {
    const res = await request(app)
      .get(`/api/users/username/${seededAdmin.username}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(String(seededAdmin._id));
  });

  it('should return 401 if no token is provided', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
  });

  it('should return 403 if user does not have ADMIN role', async () => {
    // Create a user without ADMIN role and get token for it
    const userRes = await request(app)
      .post('/api/users/signup/user')
      .send({
        username: 'normaluser2',
        password: 'Passw0rd!',
        email: 'normaluser2@example.com'
      });
    
    expect(userRes.status).toBe(201);

    const loginRes = await request(app)
      .post('/api/auth')
      .send({
        username: 'normaluser',
        password: 'Passw0rd!',
      });
    expect(loginRes.status).toBe(200);
    const userToken = loginRes.body.data.token;

    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });

  describe('PUT /api/users/:id - update user', () => {
    it('should allow admin to update any user', async () => {
      const res = await request(app)
        .put(`/api/users/${normalUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Name by Admin' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
      expect(res.body.data.name).toBe('Updated Name by Admin');
    });

    it('should allow user to update own profile', async () => {
      const res = await request(app)
        .put(`/api/users/${normalUserId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Updated Name by User' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
      expect(res.body.data.name).toBe('Updated Name by User');
    });

    it('should forbid user to update another user\'s profile', async () => {
      // normaluser tries to update admin's profile
      const res = await request(app)
        .put(`/api/users/${seededAdmin._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Hacker Name' });

      expect(res.status).toBe(403);
      expect(res.body.status).toBe(false);
      expect(res.body.error).toMatch(/forbidden/i);
    });

    it('should return 400 if invalid data sent', async () => {
      const res = await request(app)
        .put(`/api/users/${normalUserId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ username: '' }); // invalid username

      expect(res.status).toBe(400);
      expect(res.body.status).toBe(false);
      expect(Array.isArray(res.body.errors)).toBe(true);
    });

    it('should return 401 if no token provided', async () => {
      const res = await request(app)
        .put(`/api/users/${normalUserId}`)
        .send({ name: 'No Token' });

      expect(res.status).toBe(401);
      expect(res.body.status).toBe(false);
    });

    //added tests
    it('should hash password if provided', async () => {
      const newPassword = 'NewPass123!';
      const res = await request(app)
        .put(`/api/users/${normalUserId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ password: newPassword });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
      expect(res.body.data.hashedPassword).not.toBe(newPassword);

      // Ensure user can login with new password
      const loginRes = await request(app)
        .post('/api/auth')
        .send({ username: 'normaluser', password: newPassword });
      expect(loginRes.status).toBe(200);
      expect(loginRes.body.data.token).toBeDefined();
    });


    it('should return 409 if username already exists for another user', async () => {
      // Create a second user to conflict with
      const conflictRes = await request(app)
        .post('/api/users/signup/user')
        .send({
          username: 'conflictuser',
          password: 'Passw0rd!',
          email: 'conflict@example.com'
        });
      expect(conflictRes.status).toBe(201);

      // Attempt to update normaluser's username to "conflictuser"
      const res = await request(app)
        .put(`/api/users/${normalUserId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ username: 'conflictuser' });

      expect(res.status).toBe(409);
      expect(res.body.status).toBe(false);
      expect(res.body.error).toMatch(/username already taken/i);
    });

    it('should hit catch block if DAO throws unexpected error', async () => {
      // Temporarily replace DAO.update with a failing version
      const originalUpdate = userDAO.update;
      userDAO.update = async () => { throw new Error('Simulated DAO failure'); };

      const res = await request(app)
        .put(`/api/users/${normalUserId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Trigger Error' });

      expect(res.status).toBe(500);
      expect(res.body.status).toBe(false);
      expect(res.body.error).toMatch(/Simulated DAO failure/i);

      // Restore original DAO.update
      userDAO.update = originalUpdate;
    });
  });

  describe('DELETE /api/users/:id - delete user', () => {
    let userToDeleteId: string;

    beforeAll(async () => {
      // Create a user to delete
      const res = await request(app)
        .post('/api/users/signup/user')
        .send({
          username: 'tobedeleted',
          password: 'Passw0rd!',
          email: 'delete@example.com',
        });
      userToDeleteId = res.body.data.id || res.body.data._id;
    });

    it('should forbid delete without token', async () => {
      const res = await request(app).delete(`/api/users/${userToDeleteId}`);
      expect(res.status).toBe(401);
      expect(res.body.status).toBe(false);
    });

    it('should forbid delete if user is not admin', async () => {
      const res = await request(app)
        .delete(`/api/users/${userToDeleteId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403); 
    });

    it('should allow admin to delete a user', async () => {
      const res = await request(app)
        .delete(`/api/users/${userToDeleteId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
      expect(res.body.message).toMatch(/deleted successfully/i);
    });

    it('should return 404 when deleting non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .delete(`/api/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.status).toBe(false);
      expect(res.body.error).toMatch(/does not exist/i);
    });
    
    // additional tests
    it('should return 500 if DAO.deleteById throws an error', async () => {
      // Temporarily replace DAO with one that throws
      const originalDelete = userDAO.deleteById;
      userDAO.deleteById = jest.fn().mockImplementationOnce(() => {
        throw new Error('Simulated DAO error');
      });

      const res = await request(app)
        .delete(`/api/users/${userToDeleteId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(500);
      expect(res.body.status).toBe(false);
      expect(res.body.error).toMatch(/Simulated DAO error/i);

      // restore DAO
      userDAO.deleteById = originalDelete;
    });
  });
});


//cover uncoverd
describe('GET /api/users error handling', () => {
  let adminToken: string;

  beforeAll(async () => {
    // Login admin and get token (reuse your existing code)
    const loginRes = await request(app)
      .post('/api/auth')
      .send({ username: 'admin1', password: 'Passw0rd!' });
    adminToken = loginRes.body.data.token;
  });

  it('should return 500 if userDAO.readAll throws an error', async () => {
    // Mock readAll to throw
    jest.spyOn(userDAO, 'readAll').mockImplementationOnce(() => {
      throw new Error('Simulated DAO failure');
    });

    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(500);
    expect(res.body.status).toBe(false);
    expect(res.body.error).toBe('Simulated DAO failure');

    // Restore original implementation after test (optional if test isolated)
    (userDAO.readAll as jest.Mock).mockRestore();
  });

  it('should return 401 if no auth header', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
    expect(res.body.status).toBe(false);
  });

  it('should return 409 if username already exists when creating admin', async () => {
    // First, create an admin
    await request(app)
      .post('/api/users/signup/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        username: 'existingadmin',
        password: 'Passw0rd!',
        email: 'existingadmin@example.com',
        roles: ['ADMIN'],
      });

    // Try to create again with same username
    const res = await request(app)
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
    await request(app)
      .post('/api/users/signup/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        username: 'adminemail',
        password: 'Passw0rd!',
        email: 'adminemail@example.com',
        roles: ['ADMIN'],
      });

    // Try to create again with same email
    const res = await request(app)
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