/* eslint-disable no-console */
import mongoose, { Types } from 'mongoose';
import request from 'supertest';
import dotenv from 'dotenv';
import app from '../../app';
import bcrypt from 'bcrypt';
import User from '../models/users.models';

jest.mock('../../utils/appwrite.ts', () => ({
  client: {},
}));

dotenv.config({ override: false });

console.log('MONGODB_TEST_URI exists?', !!process.env.MONGODB_TEST_URI);
console.log('JWT_SECRET exists?', !!process.env.JWT_SECRET);

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
  try {
    await mongoose.connect(process.env.MONGODB_TEST_URI!);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err);
  }
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
    console.log('\x1b[31m%s\x1b[0m', '***Admin token***:', adminToken);
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

});

