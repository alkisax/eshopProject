import { connect, disconnect } from 'mongoose';
import request from 'supertest';
import { hash } from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

import { commodityDAO } from '../daos/commodity.dao';
import { ValidationError } from '../../utils/error/errors.types';

// Add this mock at the top of your test file to ensure it doesn't interact with the actual Stripe service during tests.
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    // Mock the methods you need, e.g., charge, paymentIntents, etc.
    charges: {
      create: jest.fn().mockResolvedValue({ success: true })
    }
  }));
});

jest.mock('../../utils/appwrite.ts', () => ({
  account: {
    get: jest.fn(),
    create: jest.fn(),
    deleteSession: jest.fn(),
  },
  OAuthProvider: { Google: 'google' },
}));

jest.mock('../../login/services/auth.service.ts', () => ({
  authService: {
    ...jest.requireActual('../../login/services/auth.service.ts').authService,
    googleAuth: jest.fn(),  // stubbed out
  },
}));

import app from '../../app';
import User from '../../login/models/users.models';
import Commodity from '../models/commodity.models';

process.env.STRIPE_SECRET_KEY = 'sk_test_dummy';
process.env.FRONTEND_URL = 'http://localhost:5173';

if (!process.env.MONGODB_TEST_URI) {
  throw new Error('MONGODB_TEST_URI environment variable is required');
}

const TEST_ADMIN = {
  username: 'adminuser',
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'securepassword',
  roles: ['ADMIN'],
};

const TEST_USER = {
  username: 'normaluser',
  name: 'Normal User',
  email: 'user@example.com',
  password: 'securepassword',
  roles: ['USER'],
};

let adminToken: string;
let userToken: string;
let commodityId: string;

let userId: string;

beforeAll(async () => {
  await connect(process.env.MONGODB_TEST_URI!);
  await User.deleteMany({});
  await Commodity.deleteMany({});

  // Create admin user
  const hashedPasswordAdmin = await hash(TEST_ADMIN.password, 10);
  await User.create({
    username: TEST_ADMIN.username,
    name: TEST_ADMIN.name,
    email: TEST_ADMIN.email,
    hashedPassword: hashedPasswordAdmin,
    roles: TEST_ADMIN.roles,
  });

  const adminRes = await request(app)
    .post('/api/auth')
    .send({ username: TEST_ADMIN.username, password: TEST_ADMIN.password });

  adminToken = adminRes.body.data.token;

  // Create normal user
  const hashedPasswordUser = await hash(TEST_USER.password, 10);
  const user = await User.create({
    username: TEST_USER.username,
    name: TEST_USER.name,
    email: TEST_USER.email,
    hashedPassword: hashedPasswordUser,
    roles: TEST_USER.roles,
  });
  userId = user._id.toString();

  const userRes = await request(app)
    .post('/api/auth')
    .send({ username: TEST_USER.username, password: TEST_USER.password });

  userToken = userRes.body.data.token;
});

afterAll(async () => {
  await User.deleteMany({});
  await Commodity.deleteMany({});
  await disconnect();
});

describe('Commodity Controller', () => {
  it('should create a new commodity (admin only)', async () => {
    const res = await request(app)
      .post('/api/commodity')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Commodity',
        description: 'A test commodity',
        price: 20,
        currency: 'eur',
        stripePriceId: 'price_123',
        stock: 10,
        active: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Test Commodity');
    commodityId = res.body.data._id;
  });

  it('should fail to create commodity without admin token', async () => {
    const res = await request(app)
      .post('/api/commodity')
      .send({
        name: 'No Auth Commodity',
        price: 15,
        stripePriceId: 'price_noauth',
      });

    expect(res.status).toBe(401);
  });

  it('should fetch all commodities', async () => {
    const res = await request(app).get('/api/commodity');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should fetch a commodity by ID', async () => {
    const res = await request(app).get(`/api/commodity/${commodityId}`);
    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(commodityId);
  });

  it('should update a commodity (admin only)', async () => {
    const res = await request(app)
      .patch(`/api/commodity/${commodityId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ stock: 50 });

    expect(res.status).toBe(200);
    expect(res.body.data.stock).toBe(50);
  });

  it('should allow user to add a comment', async () => {
    const res = await request(app)
      .post(`/api/commodity/${commodityId}/comments`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ user: userId, text: 'Great product!', rating: 5 });

    expect(res.status).toBe(200);
    expect(res.body.data.comments.length).toBe(1);
    expect(res.body.data.comments[0].text).toBe('Great product!');
  });

  it('should allow admin to clear comments', async () => {
    const res = await request(app)
      .delete(`/api/commodity/${commodityId}/comments`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.comments.length).toBe(0);
  });

  it('should delete a commodity (admin only)', async () => {
    const res = await request(app)
      .delete(`/api/commodity/${commodityId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted successfully/);
  });

  it('should sell a commodity and update stock/soldCount (admin only)', async () => {
    const createRes = await request(app)
      .post('/api/commodity')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Deck K',
        price: 90,
        currency: 'eur',
        stripePriceId: 'price_k',
        stock: 5,
        active: true,
      });
    const id = createRes.body.data._id;

    const sellRes = await request(app)
      .patch(`/api/commodity/sell/${id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: 2 });

    expect(sellRes.status).toBe(200);
    expect(sellRes.body.data.stock).toBe(3);
    expect(sellRes.body.data.soldCount).toBe(2);
  });

  it('should fail to sell if stock is insufficient', async () => {
    const createRes = await request(app)
      .post('/api/commodity')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Deck L',
        price: 100,
        currency: 'eur',
        stripePriceId: 'price_l',
        stock: 1,
        active: true,
      });
    const id = createRes.body.data._id;

    const sellRes = await request(app)
      .patch(`/api/commodity/sell/${id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: 5 });

    expect(sellRes.status).toBe(400);
  });

  describe('Delete single comment', () => {
    interface CommentResponse {
      _id: string;
      text: string;
      rating?: number;
    }
    let commentId: string;

    beforeEach(async () => {
      // ensure a fresh commodity exists with unique stripePriceId
      const createRes = await request(app)
        .post('/api/commodity')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: `Temp Deck ${Date.now()}`,
          price: 50,
          currency: 'eur',
          stripePriceId: `price_${Date.now()}`, // unique every run
          stock: 10,
          active: true,
        });

      expect(createRes.status).toBe(201);
      commodityId = createRes.body.data._id;

      // then add comment
      const res = await request(app)
        .post(`/api/commodity/${commodityId}/comments`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ user: userId, text: 'Temp comment', rating: 4 as const });

      expect(res.status).toBe(200);
      commentId = res.body.data.comments[0]._id;
    });

    it('should allow admin to delete a specific comment', async () => {
      const res = await request(app)
        .delete(`/api/commodity/${commodityId}/comments/${commentId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      const comments: CommentResponse[] = res.body.data.comments;
      const exists = comments.find(c => c._id === commentId);
      expect(exists).toBeUndefined();
    });

    // bad test i know but had to do it. so lets leave it
    it('should return 200 and leave comments unchanged if commentId does not exist', async () => {
      const fakeCommentId = '64cfc3c5b5f1f1f1f1f1f1f1'; // valid ObjectId format
      const res = await request(app)
        .delete(`/api/commodity/${commodityId}/comments/${fakeCommentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.comments.length).toBeGreaterThan(0); // unchanged
    });

    it('should return 400 if missing commentId (mocked)', async () => {
      jest.spyOn(commodityDAO, 'deleteCommentFromCommoditybyCommentId')
        .mockImplementationOnce(() => { throw new ValidationError('Missing commentId'); });

      const res = await request(app)
        .delete(`/api/commodity/${commodityId}/comments/fake`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      jest.restoreAllMocks();
    });
  });


  describe('Negative cases', () => {
    it('should return 400 if creating comment without user/text', async () => {
      const res = await request(app)
        .post(`/api/commodity/${commodityId}/comments`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ rating: 3 }); // missing user + text

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Comment requires user and text/);
    });

    it('should return 404 when fetching a non-existent commodity', async () => {
      const fakeId = '64cfc3c5b5f1f1f1f1f1f1f1';
      const res = await request(app).get(`/api/commodity/${fakeId}`);
      expect(res.status).toBe(404);
    });

    it('should return 404 when updating non-existent commodity', async () => {
      const fakeId = '64cfc3c5b5f1f1f1f1f1f1f1';
      const res = await request(app)
        .patch(`/api/commodity/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ stock: 77 });

      expect(res.status).toBe(404);
    });

    it('should return 404 when deleting non-existent commodity', async () => {
      const fakeId = '64cfc3c5b5f1f1f1f1f1f1f1';
      const res = await request(app)
        .delete(`/api/commodity/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    it('should return 401/403 when non-admin tries to create commodity', async () => {
      const res = await request(app)
        .post('/api/commodity')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Unauthorized Commodity',
          price: 10,
          stripePriceId: 'price_unauth',
        });

      expect([401, 403]).toContain(res.status);
    });

    it('should return 401/403 when non-admin tries to delete commodity', async () => {
      const res = await request(app)
        .delete(`/api/commodity/${commodityId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect([401, 403]).toContain(res.status);
    });

    it('should return 400 when updating commodity without ID param', async () => {
      const res = await request(app)
        .patch('/api/commodity/') // missing id
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ stock: 99 });

      expect([400, 404]).toContain(res.status);
    });

    it('should return 400 when deleting commodity without ID param', async () => {
      const res = await request(app)
        .delete('/api/commodity/')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([400, 404]).toContain(res.status);
    });

    it('should return 400 when clearing comments without ID param', async () => {
      const res = await request(app)
        .delete('/api/commodity//comments')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([400, 404]).toContain(res.status);
    });
  });
});

describe ('some additional sad way tests', () => {
  let adminToken: string;
  // let commodityId: string;

  beforeAll(async () => {
    if (!process.env.MONGODB_TEST_URI) {
      throw new Error('MONGODB_TEST_URI is required for tests');
    }
    await connect(process.env.MONGODB_TEST_URI);

    // clear before inserting
    await User.deleteMany({});
    await Commodity.deleteMany({});
    
    // create admin user in DB
    const hashedPassword = await hash('securepassword', 10);
    await User.create({
      username: 'adminuser',
      name: 'Admin User',
      email: 'admin@example.com',
      hashedPassword,
      roles: ['ADMIN'],
    });

    // login to get token
    const res = await request(app)
      .post('/api/auth')
      .send({ username: 'adminuser', password: 'securepassword' });

    adminToken = res.body.data.token;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Commodity.deleteMany({});
    // await disconnect();
  });
  
  it('should return 400 if commodityDAO.createCommodity throws ValidationError (mocked)', async () => {
    // Arrange: spy on DAO
    jest.spyOn(commodityDAO, 'createCommodity')
      .mockImplementationOnce(() => { throw new ValidationError('Invalid commodity data'); });

    // Act: make request
    const res = await request(app)
      .post('/api/commodity')
      .set('Authorization', `Bearer ${adminToken}`) // ensure ADMIN
      .send({
        name: 'Broken Item',
        price: 20,
        currency: 'eur',
        stripePriceId: 'fake_id',
        stock: 5
      });

    // Assert: response handled by catch -> handleControllerError
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(false);
    expect(res.body.error || res.body.message).toMatch(/Invalid commodity data/);

    // Cleanup
    jest.restoreAllMocks();
  });

  it('should return 400 if missing quantity in sellById', async () => {
    const res = await request(app)
      .patch('/api/commodity/sell/123fakeId')
      .set('Authorization', `Bearer ${adminToken}`) // must be ADMIN
      .send({}); // no quantity

    expect(res.status).toBe(400);
    expect(res.body.status).toBe(false);
    expect(res.body.message).toMatch(/Commodity ID and quantity are required/);
  });

  it('should return 400 if DAO throws inside addComment', async () => {
    // 🔄 load the real DAO instead of the global mock
    // jest.unmock('../daos/commodity.dao');
    // // Load the real module (not the mocked one)
    // const realCommodityDAOModule = jest.requireActual('../daos/commodity.dao');

    // // Narrow it to the right type
    // const realCommodityDAO = realCommodityDAOModule as typeof import('../daos/commodity.dao');

    // // Now TS knows the shape: has createCommodity, addCommentToCommodity, etc.
    // (commodityDAO as Partial<typeof commodityDAO>).createCommodity = realCommodityDAO.createCommodity;
    // (commodityDAO as Partial<typeof commodityDAO>).addCommentToCommodity = realCommodityDAO.addCommentToCommodity;

    // 👇 create a commodity so we have a valid id
    const commodityRes = await request(app)
      .post('/api/commodity')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Commodity',
        price: 15,
        currency: 'eur',
        stripePriceId: `stripe_test_${Date.now()}`,
        stock: 10,
      });

    //This way if creation fails, the test will fail with a clearer message.
    expect(commodityRes.status).toBe(201); // ensure creation worked
    expect(commodityRes.body.data).toBeDefined(); // sanity check
    const commodityId = commodityRes.body.data._id;

    // 👇 force DAO to throw
    jest.spyOn(commodityDAO, 'addCommentToCommodity')
      .mockImplementationOnce(() => { throw new ValidationError('Mocked DAO fail'); });

    const res = await request(app)
      .post(`/api/commodity/${commodityId}/comments`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ user: '123', text: 'hi', rating: 5 });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe(false);
    expect(res.body.error || res.body.message).toMatch(/Mocked DAO fail/);

    jest.restoreAllMocks();
  });

  it('should return 400 if DAO throws inside clearComments', async () => {
    // 👇 create a commodity so we have a valid id
    const commodityRes = await request(app)
      .post('/api/commodity')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'ClearTest Commodity',
        price: 25,
        currency: 'eur',
        stripePriceId: `stripe_clear_${Date.now()}`,
        stock: 5,
      });

    expect(commodityRes.status).toBe(201); // sanity check
    const commodityId = commodityRes.body.data._id;

    // 👇 force DAO to throw
    jest.spyOn(commodityDAO, 'clearCommentsFromCommodity')
      .mockImplementationOnce(() => { throw new ValidationError('Mocked DAO fail on clear'); });

    const res = await request(app)
      .delete(`/api/commodity/${commodityId}/comments`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
    expect(res.body.status).toBe(false);
    expect(res.body.error || res.body.message).toMatch(/Mocked DAO fail on clear/);

    jest.restoreAllMocks();
  });

});
