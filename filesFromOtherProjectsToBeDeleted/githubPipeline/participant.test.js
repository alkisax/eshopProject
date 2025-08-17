const mongoose = require("mongoose");
const request = require("supertest");
const bcrypt = require("bcrypt");
require("dotenv").config();
const app = require("../app");

// Add this mock at the top of your test file to ensure it doesn't interact with the actual Stripe service during tests.
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    // Mock the methods you need, e.g., charge, paymentIntents, etc.
    charges: {
      create: jest.fn().mockResolvedValue({ success: true })
    }
  }));
});

const Admin = require("../models/admins.models");
const Participant = require("../models/participant.models");

const TEST_ADMIN = {
  username: "adminuser",
  name: "Admin User",
  email: "admin@example.com",
  password: "securepassword",
  roles: ["admin"],
};

let token;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_TEST_URI);
  await Admin.deleteMany({});
  await Participant.deleteMany({});

  const hashedPassword = await bcrypt.hash(TEST_ADMIN.password, 10);

  await Admin.create({
    username: TEST_ADMIN.username,
    name: TEST_ADMIN.name,
    email: TEST_ADMIN.email,
    hashedPassword: hashedPassword,
    roles: TEST_ADMIN.roles,
  });

  const res = await request(app)
    .post("/api/login")
    .send({ username: TEST_ADMIN.username, password: TEST_ADMIN.password });

  token = res.body.data.token;
});

afterAll(async () => {
  await Admin.deleteMany({});
  await Participant.deleteMany({});
  await mongoose.disconnect();
});

describe("Participant API", () => {
  describe("GET /api/participant", () => {
    it("should return 200 and list participants if admin is authorized", async () => {
      const res = await request(app)
        .get("/api/participant")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("should return 403 if no token is provided", async () => {
      const res = await request(app).get("/api/participant");
      expect(res.status).toBe(403);
      expect(res.body.status).toBe(false);
    });
  });

  describe("POST /api/participant", () => {
    it("should create a participant and return 201", async () => {
      const newParticipant = {
        name: "John",
        surname: "Doe",
        email: "johndoe@example.com",
        transactions: [],
      };

      const res = await request(app)
        .post("/api/participant")
        .send(newParticipant);

      expect(res.status).toBe(201);
      expect(res.body.name).toBe(newParticipant.name);
      expect(res.body.email).toBe(newParticipant.email);
    });

    it("should return 400 if required fields are missing", async () => {
      const incompleteData = {
        name: "Jane",
      };

      const res = await request(app)
        .post("/api/participant")
        .send(incompleteData);

      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /api/participants/:id", () => {
    it("should delete a participant if ID is valid and admin authorized", async () => {
      const participant = await request(app)
        .post("/api/participant")
        .send({
          name: "Delete Me",
          surname: "Test",
          email: "deleteme@example.com",
          transactions: [],
        });

      const id = participant.body._id;

      const res = await request(app)
        .delete(`/api/participant/${id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
    });

    it("should return 404 if participant does not exist", async () => {
      const validButMissingId = "507f1f77bcf86cd799439011";

      const res = await request(app)
        .delete(`/api/participant/${validButMissingId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it("should return 500 if ID format is invalid", async () => {
      const res = await request(app)
        .delete("/api/participant/invalid-id-format")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(500);
    });

    it("should return 400 if ID is missing", async () => {
      const res = await request(app)
        .delete("/api/participant/")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404); // Express will return 404 if the route doesn't match
    });
  });
});
