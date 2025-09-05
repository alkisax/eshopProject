import { connect, disconnect } from 'mongoose';
import request from 'supertest';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();
import app from '../../app';
import Upload from '../upload.model';
import User from '../../login/models/users.models';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

if (!process.env.MONGODB_TEST_URI) {
  throw new Error('MONGODB_TEST_URI is required');
}
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

let adminToken: string;

beforeAll(async () => {
  await connect(process.env.MONGODB_TEST_URI!);
  await Upload.deleteMany({});
  await User.deleteMany({});

  // seed admin user
  const plainPassword = 'Passw0rd!';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  const admin = await User.create({
    username: 'admin1',
    hashedPassword,
    roles: ['ADMIN'],
    email: 'admin@example.com',
    name: 'Admin User',
  });

  // sign JWT manually (middleware only checks validity & role)
  adminToken = jwt.sign(
    {
      id: admin._id.toString(),
      username: admin.username,
      email: admin.email,
      roles: admin.roles,
    },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );
});

afterAll(async () => {
  await Upload.deleteMany({});
  await User.deleteMany({});
  await disconnect();
});

describe('POST /api/upload-multer', () => {
  const imagePath = path.join(__dirname, 'test-assets', 'dummy.jpg');

  it('should upload file without saving to Mongo', async () => {
    const res = await request(app)
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
    const res = await request(app)
      .post('/api/upload-multer?saveToMongo=true')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('image', imagePath)
      .field('name', 'WithMongo')
      .field('desc', 'Stored in db');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);

    const found = await Upload.findOne({ name: 'WithMongo' });
    expect(found).not.toBeNull();
    expect(found?.file.originalName).toBe('dummy.jpg');
  });

  it('should return 400 if no file provided', async () => {
    const res = await request(app)
      .post('/api/upload-multer?saveToMongo=true')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(400);
  });
});


import uploadDao from '../upload.dao';

describe('uploadFile controller error handling', () => {
  it('should return 500 if uploadDao.createUpload throws', async () => {
    const spy = jest
      .spyOn(uploadDao, 'createUpload')
      .mockRejectedValueOnce(new Error('DB fail'));

    const res = await request(app)
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