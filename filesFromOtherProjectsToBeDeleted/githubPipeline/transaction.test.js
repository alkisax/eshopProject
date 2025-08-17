const mongoose = require("mongoose");
const request = require("supertest");
require("dotenv").config();
const app = require("../app");

const Admin = require("../models/admins.models");
const Participant = require("../models/participant.models");
const Transaction = require("../models/transaction.models");

const TEST_ADMIN = {
  username: "adminuser",
  name: "Admin User",
  email: "admin@example.com",
  password: "securepassword",
  roles: ["admin"],
};

let token;
let participantId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_TEST_URI);
  await Admin.deleteMany({});
  await Participant.deleteMany({});
  await Transaction.deleteMany({});

  const bcrypt = require("bcrypt");
  const hashedPassword = await bcrypt.hash(TEST_ADMIN.password, 10);

  await Admin.create({
    username: TEST_ADMIN.username,
    name: TEST_ADMIN.name,
    email: TEST_ADMIN.email,
    hashedPassword,
    roles: TEST_ADMIN.roles,
  });

  const res = await request(app)
    .post("/api/login")
    .send({ username: TEST_ADMIN.username, password: TEST_ADMIN.password });

  token = res.body.data.token;

  const participantRes = await request(app)
    .post("/api/participant")
    .send({
      name: "Test",
      surname: "User",
      email: "testuser@example.com",
      transactions: [],
    });

  participantId = participantRes.body._id;
});

afterAll(async () => {
  await Admin.deleteMany({});
  await Participant.deleteMany({});
  await Transaction.deleteMany({});
  await mongoose.disconnect();
});

describe("Transaction API", () => {
  describe("POST /api/transaction", () => {
    it("should create a transaction and return 201", async () => {
      const transaction = {
        amount: 100,
        participant: participantId,
        processed: false,
      };

      const res = await request(app).post("/api/transaction").send(transaction);

      expect(res.status).toBe(201);
      expect(res.body.amount).toBe(transaction.amount);
      expect(res.body.participant).toBe(participantId);
    });

    it("should return 400 if required fields are missing", async () => {
      const res = await request(app).post("/api/transaction").send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });
  });

  describe("GET /api/transaction", () => {
    it("should return all transactions (authorized)", async () => {
      const res = await request(app)
        .get("/api/transaction")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("should return 403 if not authorized", async () => {
      const res = await request(app).get("/api/transaction");

      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/transaction/unprocessed", () => {
    it("should return only unprocessed transactions", async () => {
      const res = await request(app)
        .get("/api/transaction/unprocessed")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe("PUT /api/transaction/toggle/:id", () => {
    it("should return 404 if transaction not found", async () => {
      const res = await request(app)
        .put("/api/transaction/toggle/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/transaction/:id", () => {
    it("should delete a transaction successfully", async () => {
      const createRes = await request(app).post("/api/transaction").send({
        amount: 70,
        participant: participantId,
      });

      const transactionId = createRes.body._id;

      const res = await request(app)
        .delete(`/api/transaction/${transactionId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
    });

    it("should return 404 if transaction not found", async () => {
      const res = await request(app)
        .delete("/api/transaction/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it("should return 400 for missing ID", async () => {
      const res = await request(app)
        .delete("/api/transaction/")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404); // route not found
    });
  });
});
