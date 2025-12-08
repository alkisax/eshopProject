# backend
- **security issue:** if a user is logged in passes middleware. can access sensitive info of others? Θα πρέπει να φτιαχτούν διαφορετικά endpoints για τον guest που να κάνουν την ίδια δουλειά αλλα να μην έχουν verification middliware - εγινε με checkSelfOrAdmin ✅
- problems in github login ✅
- delete only one comment ✅
- bind participant to user ✅
- transfer email message to .env ✅
- cart total price ❌ will not do. as front can do i by it self
- swagger fro participant find by id/email ✅
- remove middleware from cart. guests need cart ✅
- /cart/clean-junk ✅ clear old transactions✅(5 years) /participant/clear ✅(longer than lastupdated a week)
- stripe paypal and gpay (said its on stripe dashboard) ✅
- stripe webhooks ✅
- multer upload ✅
- appwrite image bucket ✅
- clear junk endpoint✅
- add logger to save to file after stripe success ✅
- participants must have shipping address end email / users must have shipping address ✅ implemented by adding shipping info to transaction
- (what happens to deleted commodity images?)
- webhook swagger and tests ✅
- new category schema with supercategory, and allow parent category with arr of categories as child. Also some categories to have an atribute of "tag" ✅
- comment crud ✅
- fix email ✅
- chat gpt profanity comment test. if not pass wait for admin aproval ✅
- cosline similarity commodity search✅
- create a security risks checklist ✅
- endpoint for importing/exporting via excel ✅
- endpoint for exporting images zip ✅
- endpoint for full excel update ✅
- sitemap for dynamic pages in backend

# frontend
- minimal shop ✅
- minimal cart page ✅ 
- checkout ✅
- right sidebar in store if cart with edit quantities ✅
- left sidebar in store with criteria and search ✅
- προηγούμενες αγορες ✅
- crud εμπορευματων και transaction - admin pannel ✅
- add create commodity to admin panel → commodity tab ✅
- add image to commodity admin panel → commodity tab → edit ✅
- πρέπει να δώσει υποχρεωτικα Mail ο guest για να του έρθει το confirmation ✅
- πόσα έχουν πουληθεί στο admin pannel commodities ✅
- notes in shipping unresponcive ✅
- if no commodity image show sth ✅
- bugs in search categories ✅
- GAnalytics now tracks commodity impretions and commodity pages ✅, learn dashboard
- chat gpt criteria optimiser ✅
- αγαπημένα προιόντα ❤️ ✅
- τα έξοδα αποστολής να προστήθεντε (ως invisible commodities)✅
- αρχική σελιδα με κεντρικές κατηγορίες ✅
- μονο παρεντ κατεγκορισ✅
- seo ✅
- favorites in initialiser ✅
- no refresh in toggle proccesed ❓(tested and now working... did not touch)
- add slug to commodity so as to have slug urls ✅
- τα εμπορεύματα χρειάζονται uuid ✅
- hide admin and uploader user ✅
- αυτή τη στιγμή όποτε χρειάζετε μου φαίρνει ΌΛΑ τα εμπορεύματα και μετά κανει search ή ότι άλλο client size. Πρέπει να αλλάξει
- user order history
- vectorise order history

- ## e2e test

# security  

### ⚠️ Still important to consider
- 🚨 Replace localStorage with httpOnly cookies → biggest gain.
- 🚨 Avoid tokens in query params on OAuth success → fix Google/GitHub flow.

### 🔐 Frontend – already done

- DOMPurify for blog/Editor.js rendering
- React auto-escaping for plain text (comments, commodity descriptions)
- Frontend validators (password, email, postal, phone) aligned with backend
- No raw dangerouslySetInnerHTML except sanitized renderer
- Google Maps iframe hardcoded, not user-provided
- Role-based protected routes (PrivateRoute, AdminPrivateRoute)

### ⚙️ Backend – already done

- Winston logger
- CORS with allow-list
- Helmet with CSP
- Zod input validation
- Role-based access control
- Healthcheck API endpoint
- Rate limiter (global + login brute-force)
- Automated tests in GitHub Actions
- DAO pattern for DB access
- Environment variables for secrets
- Upload size restriction
- JWT authentication, passwords hashed (never stored plain)
- npm audit for dependency vulnerabilities
 Dependencies → npm audit✅

# notes
### Render setup
Root Directory: leave blank (since backend + frontend are in root).
Build Command:
`cd frontend && npm install && npm run build && cd ../backend && npm install && npm run build`
Start Command:
`cd backend && npm start`

test success stripe
`http://localhost:5173/checkout-success?session_id=cs_live_a1PBF9KvFU5WOiYAIA6FyI3zpQfRDR54C1VO7OJTBax1YfytAyK2bygMFj`






- 'as any' not allowed, follow strict types
- avoid using mock. if have to use spy on
- spyon if used will be in a seperate discribe in end
- spyon will be mount/unmount inside each specific it test
- be simple
- be extensive, we are going for full coverage
- test not only hapy path, and all 'if's
- you can follow this example

// tests/user.addfavorite.test.ts
import dotenv from 'dotenv';
dotenv.config();
import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import app from '../../app';
import User from '../../login/models/users.models';
import Commodity from '../../stripe/models/commodity.models';

if (!process.env.MONGODB_TEST_URI) {
  throw new Error('MONGODB_TEST_URI is required');
}
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

let adminToken = '';
let userToken = '';
let userId = '';
let commodityId = '';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_TEST_URI!);
  await User.deleteMany({});
  await Commodity.deleteMany({});

  // 👤 Create admin
  const hashedAdminPassword = await bcrypt.hash('Passw0rd!', 10);
  const admin = await User.create({
    username: 'admin-favorites',
    hashedPassword: hashedAdminPassword,
    roles: ['ADMIN'],
    email: 'admin-favorites@example.com',
    name: 'Admin Fav',
  });
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

  // 👤 Create normal user
  const hashedUserPassword = await bcrypt.hash('Passw0rd!', 10);
  const normalUser = await User.create({
    username: 'normal-fav-user',
    hashedPassword: hashedUserPassword,
    roles: ['USER'],
    email: 'normal-fav@example.com',
    name: 'Normal Fav User',
  });
  userId = normalUser._id.toString();

  userToken = jwt.sign(
    {
      id: normalUser._id.toString(),
      username: normalUser.username,
      email: normalUser.email,
      roles: normalUser.roles,
    },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );

  // 🛒 Commodity
  const commodity = await Commodity.create({
    name: 'Fav Commodity',
    price: 42,
    currency: 'eur',
    stripePriceId: 'price_fav_test',
  });
  commodityId = commodity._id.toString();
});

afterAll(async () => {
  await Commodity.deleteMany({});
  await User.deleteMany({});
  await mongoose.disconnect();
});

describe('POST /api/users/:id/favorites (add)', () => {
  it('401 if no token', async () => {
    const res = await request(app)
      .post(`/api/users/${userId}/favorites`)
      .send({ commodityId });
    expect(res.status).toBe(401);
  });

  it('403 if wrong user and not admin', async () => {
    const stranger = await User.create({
      username: 'stranger-fav',
      hashedPassword: await bcrypt.hash('Passw0rd!', 10),
      roles: ['USER'],
      email: 'stranger-fav@example.com',
      name: 'Stranger Fav',
    });

    const strangerToken = jwt.sign(
      {
        id: stranger._id.toString(),
        username: stranger.username,
        email: stranger.email,
        roles: stranger.roles,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    const res = await request(app)
      .post(`/api/users/${userId}/favorites`)
      .set('Authorization', `Bearer ${strangerToken}`)
      .send({ commodityId });

    expect(res.status).toBe(403);
  });

  it('400 if no commodityId provided', async () => {
    const res = await request(app)
      .post(`/api/users/${userId}/favorites`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/commodityId required/);
  });

  it('200 if self → adds favorite', async () => {
    const res = await request(app)
      .post(`/api/users/${userId}/favorites`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ commodityId });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(res.body.data.favorites).toContain(commodityId);
  });

  it('200 if admin → adds favorite to other user', async () => {
    const res = await request(app)
      .post(`/api/users/${userId}/favorites`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ commodityId });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(res.body.data.favorites).toContain(commodityId);
  });

  it('no duplicates when adding same commodity twice', async () => {
    await request(app)
      .post(`/api/users/${userId}/favorites`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ commodityId });

    const res = await request(app)
      .post(`/api/users/${userId}/favorites`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ commodityId });

    expect(res.status).toBe(200);
    const favorites: string[] = res.body.data.favorites;
    expect(favorites.filter(id => id === commodityId).length).toBe(1);
  });
});

describe('DELETE /api/users/:id/favorites (remove)', () => {
  it('401 if no token', async () => {
    const res = await request(app)
      .delete(`/api/users/${userId}/favorites`)
      .send({ commodityId });
    expect(res.status).toBe(401);
  });

  it('400 if no commodityId provided', async () => {
    const res = await request(app)
      .delete(`/api/users/${userId}/favorites`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it('200 removes favorite successfully', async () => {
    // Ensure it's there
    await request(app)
      .post(`/api/users/${userId}/favorites`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ commodityId });

    const res = await request(app)
      .delete(`/api/users/${userId}/favorites`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ commodityId });

    expect(res.status).toBe(200);
    const favorites: string[] = res.body.data.favorites;
    expect(favorites).not.toContain(commodityId);
  });
});

// 👀 SpyOn tests (separate describe)
describe('userDAO.update (spy)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('calls update once with favorites field', async () => {
    const spy = jest.spyOn(User, 'findByIdAndUpdate').mockResolvedValueOnce({
      _id: new mongoose.Types.ObjectId(userId),
      username: 'mock-user',
      roles: ['USER'],
      favorites: [commodityId],
      createdAt: new Date(),
      updatedAt: new Date(),
      email: 'mock@example.com',
      hashedPassword: 'hashed',
    } as any);

    const res = await request(app)
      .post(`/api/users/${userId}/favorites`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ commodityId });

    expect(res.status).toBe(200);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][1]).toHaveProperty('favorites');
  });

  it('handles DAO error gracefully', async () => {
    jest.spyOn(User, 'findByIdAndUpdate').mockRejectedValueOnce(new Error('DB fail'));
    const res = await request(app)
      .post(`/api/users/${userId}/favorites`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ commodityId });
    expect(res.status).toBe(500);
    expect(res.body.status).toBe(false);
    expect(res.body.message).toMatch(/DB fail/);
  });
});
