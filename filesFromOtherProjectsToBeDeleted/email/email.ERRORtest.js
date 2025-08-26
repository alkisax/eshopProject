const mongoose = require("mongoose");
const request = require("supertest");
require("dotenv").config();
const app = require("../app");

// Mock nodemailer
jest.mock("nodemailer", () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({
      response: "250 OK",
      messageId: "test123",
      accepted: ["test@example.com"]
    })
  })
}));

// Mock transactionDAO
jest.mock("../daos/transaction.dao", () => ({
  findTransactionById: jest.fn().mockResolvedValue({
    participant: {
      email: "test@example.com",
      name: "Test User"
    }
  })
}));

describe("Email API", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_TEST_URI);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe("POST /api/email/:transactionId - Success Case", () => {
    it("should return 200 and success response when email is sent", async () => {
      const transactionId = "validTransactionId123";
      
      const res = await request(app)
        .post(`/api/email/${transactionId}`)
        .send();

      // Verify status code
      expect(res.status).toBe(200);
      
      // Verify response structure
      expect(res.body).toEqual({
        status: true,
        data: {
          response: "250 OK",
          messageId: "test123",
          accepted: ["test@example.com"]
        }
      });
      
      // Verify nodemailer was called with correct parameters
      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: "smtp.zoho.eu",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    });
  });
});