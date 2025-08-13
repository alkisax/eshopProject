/**
 * @file auth.google.test.ts
 * Tests for Google OAuth login/signup flows with mocked authService and User model
 */

jest.mock('../../utils/appwrite.ts', () => ({
  account: {},
  OAuthProvider: { Google: 'google' },
}));

import request from "supertest";
import mongoose from "mongoose";
import app from "../../app";
import { authService } from "../services/auth.service";
import User from "../models/users.models";
import dotenv from 'dotenv';
dotenv.config();

jest.mock("../services/auth.service", () => ({
  authService: {
    ...jest.requireActual("../services/auth.service").authService,
    googleAuth: jest.fn(),
  },
}));

beforeAll(async () => {
  if (!process.env.MONGODB_TEST_URI) {
    throw new Error("MONGODB_TEST_URI environment variable is required");
  }
  await mongoose.connect(process.env.MONGODB_TEST_URI);
  await mongoose.connection.collection("users").deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.collection("users").deleteMany({});
  await mongoose.disconnect();
});

describe("Google OAuth controllers", () => {

  describe("GET /api/auth/google/login", () => {
    it("should return 400 if code is missing", async () => {
      const res = await request(app).get("/api/auth/google/login");
      expect(res.status).toBe(400);
      expect(res.body.status).toBe(false);
      expect(res.body.data).toMatch(/auth code is missing/i);
    });

    it("should return 401 if googleAuth fails", async () => {
      (authService.googleAuth as jest.Mock).mockResolvedValueOnce({ error: "Failed" });

      const res = await request(app)
        .get("/api/auth/google/login?code=fakecode");
      expect(res.status).toBe(401);
      expect(res.body.status).toBe(false);
      expect(res.body.data).toMatch(/google login failed/i);
    });

    it("should redirect to signup if user not in DB", async () => {
      (authService.googleAuth as jest.Mock).mockResolvedValueOnce({
        user: { email: "newuser@example.com", name: "New User" }
      });

      jest.spyOn(User, 'findOne').mockResolvedValueOnce(null);

      const res = await request(app)
        .get("/api/auth/google/login?code=fakecode")
        .expect(302);

      expect(res.header.location).toContain("/signup");
    });

    it("should redirect to google-success if user exists", async () => {
      const fakeUser = {
        _id: new mongoose.Types.ObjectId(),
        roles: ['USER'],
        email: 'existing@example.com',
        name: 'Existing'
      };

      (authService.googleAuth as jest.Mock).mockResolvedValueOnce({
        user: { email: fakeUser.email, name: fakeUser.name }
      });

      jest.spyOn(User, 'findOne').mockResolvedValueOnce(fakeUser as any);

      const res = await request(app)
        .get("/api/auth/google/login?code=fakecode")
        .expect(302);

      expect(res.header.location).toContain("/google-success");
      expect(res.header.location).toContain(fakeUser.email);
    });
  });

  describe("GET /api/auth/google/signup", () => {

    it("should return 400 if code is missing", async () => {
      const res = await request(app).get("/api/auth/google/signup");
      expect(res.status).toBe(400);
      expect(res.body.status).toBe(false);
      expect(res.body.data).toMatch(/auth code is missing/i);
    });

    it("should return 401 if googleAuth fails", async () => {
      (authService.googleAuth as jest.Mock).mockResolvedValueOnce({ error: "Failed" });

      const res = await request(app)
        .get("/api/auth/google/signup?code=fakecode");
      expect(res.status).toBe(401);
      expect(res.body.status).toBe(false);
      expect(res.body.data).toMatch(/google login failed/i);
    });

    it("should create a new user if not exists and redirect", async () => {
      const newUserData = { email: "signupuser@example.com", name: "Signup User" };

      (authService.googleAuth as jest.Mock).mockResolvedValueOnce({ user: newUserData });

      jest.spyOn(User, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(User, 'findOneAndUpdate').mockResolvedValueOnce({
        _id: new mongoose.Types.ObjectId(),
        email: newUserData.email,
        name: newUserData.name,
        roles: ['user']
      } as any);

      const res = await request(app)
        .get("/api/auth/google/signup?code=fakecode")
        .expect(302);

      expect(res.header.location).toContain("/google-success");
      expect(res.header.location).toContain(newUserData.email);
    });

    it("should redirect existing user with token", async () => {
      const existingUser = {
        _id: new mongoose.Types.ObjectId(),
        roles: ['USER'],
        email: "existingsignup@example.com",
        name: "Existing Signup"
      };

      (authService.googleAuth as jest.Mock).mockResolvedValueOnce({
        user: { email: existingUser.email, name: existingUser.name }
      });

      jest.spyOn(User, 'findOne').mockResolvedValueOnce(existingUser as any);

      const res = await request(app)
        .get("/api/auth/google/signup?code=fakecode")
        .expect(302);

      expect(res.header.location).toContain("/google-success");
      expect(res.header.location).toContain(existingUser.email);
    });
  });

});
