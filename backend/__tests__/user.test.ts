import mongoose from "mongoose";
import request from "supertest";
import dotenv from "dotenv";
import app from "../src/app";
import type { Response, NextFunction } from 'express';
import type { AuthRequest, UserView, IUser } from "../src/login/types/user.types";
import User from "../src/login/models/users.models";

jest.mock("../src/utils/appwrite", () => ({
  client: {},
}));

dotenv.config();

beforeAll(async () => {
  if (!process.env.MONGODB_TEST_URI) {
    throw new Error("MONGODB_TEST_URI environment variable is required");
  }
  await mongoose.connect(process.env.MONGODB_TEST_URI);
});

beforeEach(async () => {
  await mongoose.connection.collection("users").deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("POST /api/users/signup/user", () => {
  it("should create a new user with valid data", async () => {
    const res = await request(app)
      .post("/api/users/signup/user")
      .send({
        username: "testuser",
        password: "Passw0rd!",
        name: "Test User",
        email: "test@example.com",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.username).toBe("testuser");

    // Ensure password is hashed in DB
    const savedUser = await User.findOne({ username: "testuser" });
    expect(savedUser).not.toBeNull();
    expect(savedUser?.hashedPassword).not.toBe("Passw0rd!");
  });

  it("should fail if username already exists", async () => {
    await User.create({
      username: "duplicate",
      hashedPassword: "hashedpass",
      name: "Existing",
      email: "exist@example.com",
      roles: ["USER"],
    });

    const res = await request(app)
      .post("/api/users/signup/user")
      .send({
        username: "duplicate",
        password: "Passw0rd!",
      });

    expect(res.status).toBe(409);
    expect(res.body.status).toBe(false);
    expect(res.body.error).toMatch(/username/i);
  });

  it("should fail if email already exists", async () => {
    await User.create({
      username: "user1",
      hashedPassword: "hashedpass",
      name: "Existing",
      email: "exist@example.com",
      roles: ["USER"],
    });

    const res = await request(app)
      .post("/api/users/signup/user")
      .send({
        username: "newuser",
        password: "Passw0rd!",
        email: "exist@example.com",
      });

    expect(res.status).toBe(409);
    expect(res.body.status).toBe(false);
    expect(res.body.error).toMatch(/email/i);
  });

  it("should fail if password does not meet requirements", async () => {
    const res = await request(app)
      .post("/api/users/signup/user")
      .send({
        username: "weakpass",
        password: "abc",
      });

    expect(res.status).toBe(400); // zod validation error
    expect(res.body).toHaveProperty("status", false);
  });
});

let createdAdmin: IUser;

jest.mock('../src/login/middleware/verification.middleware', () => ({
  middleware: {
    verifyToken: (req: AuthRequest, _res: Response, next: NextFunction) => {
      req.user = {
        id: '123',
        username: 'adminUser',
        roles: ['ADMIN'],
        createdAt: new Date(),
        updatedAt: new Date()
      } as UserView;
      next();
    },
    checkRole: () => (_req: AuthRequest, _res: Response, next: NextFunction) => {
      next();
    }
  }
}));

describe("POST /api/users/signup/admin", () => {
  it("should create a new admin with valid data", async () => {
    const res = await request(app)
      .post("/api/users/signup/admin")
      .send({
        username: "admin1",
        password: "Passw0rd!",
        name: "Super Admin",
        email: "admin1@example.com",
        roles: ["ADMIN"]
      });

    expect(res.status).toBe(201);
    expect(res.body.data.roles).toContain("ADMIN");

    // Save for later tests
    createdAdmin = res.body.data;

    const dbUser = await User.findOne({ username: "admin1" });
    expect(dbUser).not.toBeNull();
    expect(dbUser?.hashedPassword).not.toBe("Passw0rd!");
  });

  it("should fail if username already exists", async () => {
    await User.create({
      username: "existingAdmin",
      hashedPassword: "hashedpass",
      name: "Existing Admin",
      email: "existing@example.com",
      roles: ["ADMIN"],
    });

    const res = await request(app)
      .post("/api/users/signup/admin")
      .send({
        username: "existingAdmin",
        password: "Passw0rd!",
      });

    expect(res.status).toBe(409);
    expect(res.body.status).toBe(false);
    expect(res.body.error).toMatch(/username/i);
  });

  it("should fail if email already exists", async () => {
    await User.create({
      username: "otheradmin",
      hashedPassword: "hashedpass",
      name: "Other Admin",
      email: "taken@example.com",
      roles: ["ADMIN"],
    });

    const res = await request(app)
      .post("/api/users/signup/admin")
      .send({
        username: "newadmin",
        password: "Passw0rd!",
        email: "taken@example.com",
      });

    expect(res.status).toBe(409);
    expect(res.body.status).toBe(false);
    expect(res.body.error).toMatch(/email/i);
  });

  it("should fail if password is too weak", async () => {
    const res = await request(app)
      .post("/api/users/signup/admin")
      .send({
        username: "weakadmin",
        password: "abc",
      });

    expect(res.status).toBe(400); // zod validation error
    expect(res.body.status).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  it("should fail if required fields are missing", async () => {
    const res = await request(app)
      .post("/api/users/signup/admin")
      .send({
        username: "",
        password: "",
      });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe(false);
  });

  afterAll( async () => {
    // Restore original middleware for future tests
    jest.unmock("../src/login/middleware/verification.middleware.ts");
    jest.resetModules();
    const realMiddleware = await import("../src/login/middleware/verification.middleware")
  });

  afterAll(async () => {
    // Optionally store admin somewhere accessible globally
    console.log("Created admin for later tests:", createdAdmin);
  });
});