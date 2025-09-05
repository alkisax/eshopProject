import { connect, disconnect } from 'mongoose';
import request from 'supertest';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();
import app from '../../app';
import Upload from '../upload.model';
import uploadDao from '../upload.dao';
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

describe('DELETE /api/upload-multer/:id', () => {
  const imagePath = path.join(__dirname, 'test-assets', 'dummy.jpg');
  let uploadId: string;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/upload-multer?saveToMongo=true')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('image', imagePath)
      .field('name', 'DeleteMe')
      .field('desc', 'to be deleted');

    uploadId = res.body.data.file.filename ? (await Upload.findOne({ name: 'DeleteMe' }))!._id.toString() : '';
  });

  it('should delete an upload successfully', async () => {
    const res = await request(app)
      .delete(`/api/upload-multer/${uploadId}`)
      .set('Authorization', `Bearer ${adminToken}`);;
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);

    const deleted = await Upload.findById(uploadId);
    expect(deleted).toBeNull();
  });

  it('should return 404 if file not found', async () => {
    const res = await request(app)
      .delete('/api/upload-multer/507f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${adminToken}`);;
    expect(res.status).toBe(404);
  });

  it('should return 500 if DAO throws error', async () => {
    const spy = jest.spyOn(uploadDao, 'deleteUpload').mockRejectedValueOnce(new Error('DB fail'));
    const res = await request(app)
      .delete(`/api/upload-multer/${uploadId}`)
      .set('Authorization', `Bearer ${adminToken}`);;
    expect(res.status).toBe(500);
    spy.mockRestore();
  });
});
