import { connect, disconnect } from 'mongoose';
import request from 'supertest';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();
import app from '../../app';
import Upload from '../upload.model';

if (!process.env.MONGODB_TEST_URI) {
  throw new Error('MONGODB_TEST_URI is required');
}

beforeAll(async () => {
  await connect(process.env.MONGODB_TEST_URI!);
  await Upload.deleteMany({});
});

afterAll(async () => {
  await Upload.deleteMany({});
  await disconnect();
});

describe('POST /api/upload-multer', () => {
  const imagePath = path.join(__dirname, 'test-assets', 'dummy.jpg');

  it('should upload file without saving to Mongo', async () => {
    const res = await request(app)
      .post('/api/upload-multer?saveToMongo=false')
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
    const res = await request(app).post('/api/upload-multer?saveToMongo=true');
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
      .attach('image', Buffer.from('fake'), 'test.jpg')
      .field('name', 'bad')
      .field('desc', 'force error');

    expect(res.status).toBe(500);
    expect(res.body.status).toBe(false);
    expect(res.body.error).toBe('DB fail'); // ✅ match handler shape

    spy.mockRestore();
  });
});