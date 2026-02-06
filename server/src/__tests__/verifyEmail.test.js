
import request from "supertest";
import app from "../app.js";
import User from "../models/User.js";
import {
  connectToMockDB,
  closeMockDatabase,
  clearMockDatabase,
} from "../__testUtils__/dbMock.js";

const testUser = {
  username: "verifyuser",
  email: "verify@test.com",
  password: "password123",
};

let server;
let verificationToken;

describe("Verify Email API", () => {
  beforeAll(async () => {
    await connectToMockDB();
    server = app.listen(0);
  });

  afterEach(async () => {
    await clearMockDatabase();
  });

  afterAll(async () => {
    await closeMockDatabase();
    server.close();
  });

  it("should not verify with missing token", async () => {
    const res = await request(server).get("/api/users/verify-email");
    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toMatch(/required/);
  });

  it("should not verify with invalid token", async () => {
    const res = await request(server).get("/api/users/verify-email?token=invalidtoken123");
    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toMatch(/Invalid or expired/);
  });

  it("should verify with valid token", async () => {
    // Create an unverified user inside the test
    const user = await User.create(testUser);
    const validToken = user.generateVerificationToken();
    await user.save();

    const res = await request(server).get(`/api/users/verify-email?token=${validToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.msg).toMatch(/verified successfully/);

    const updatedUser = await User.findOne({ email: testUser.email });
    expect(updatedUser.isVerified).toBe(true);
    expect(updatedUser.verificationToken).toBeUndefined();
    expect(updatedUser.verificationTokenExpires).toBeUndefined();
  });

  it("should not verify again (token consumed)", async () => {
    // Create verify and consume token
    const user = await User.create({ ...testUser, email: "consumed@test.com", username: "consumed" });
    const token = user.generateVerificationToken();
    await user.save();

    // First verification
    await request(server).get(`/api/users/verify-email?token=${token}`);

    // Second verification
    const res = await request(server).get(`/api/users/verify-email?token=${token}`);
    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toMatch(/Invalid or expired/);
  });
});
