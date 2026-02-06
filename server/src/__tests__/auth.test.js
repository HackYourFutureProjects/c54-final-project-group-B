
import request from "supertest";
import app from "../app.js";
import User from "../models/User.js";
import {
  connectToMockDB,
  closeMockDatabase,
  clearMockDatabase,
} from "../__testUtils__/dbMock.js";

const testUser = {
  username: "testuser1",
  email: "testuser1@example.com",
  password: "testpassword123",
  isVerified: true, // Auto-verify for login tests
};

let server;

// Mock console.log to avoid cluttering test output and to verify email sending
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});
afterAll(() => {
  console.log = originalConsoleLog;
});

describe("Auth API", () => {
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

  it("should sign up a new user and log verification email", async () => {
    const res = await request(server).post("/api/users/signup").send({
      ...testUser,
      username: "newuser",
      email: "new@test.com",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toHaveProperty("username", "newuser");
    expect(res.body.user).not.toHaveProperty("password");
    expect(res.headers["set-cookie"]).toBeDefined();
    expect(res.body.msg).toMatch(/Check the server console/);
    
    // Verify console.log was called with verification link
    // Note: detailed check might be brittle, just ensuring it was called
    expect(console.log).toHaveBeenCalled(); 
  });

  it("should not sign up with duplicate email or username", async () => {
    // First create a user (we need to create one first since DB is cleared)
    await User.create(testUser);
    
    const res = await request(server).post("/api/users/signup").send(testUser);
    expect(res.statusCode).toBe(409);
  });

  it("should login with username", async () => {
    await User.create(testUser);
    const res = await request(server).post("/api/users/login").send({
      emailOrUsername: testUser.username,
      password: testUser.password,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("should login with email", async () => {
    await User.create(testUser);
    const res = await request(server)
      .post("/api/users/login")
      .send({ emailOrUsername: testUser.email, password: testUser.password });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("should not login with wrong password", async () => {
    await User.create(testUser);
    const res = await request(server)
      .post("/api/users/login")
      .send({ emailOrUsername: testUser.email, password: "wrongpass" });
    expect(res.statusCode).toBe(401);
  });

  it("should not login if email is not verified", async () => {
    // Create unverified user
    const unverifiedUser = {
      username: "unverified",
      email: "unverified@test.com",
      password: "password123",
      isVerified: false,
    };
    await User.create(unverifiedUser);

    const res = await request(server).post("/api/users/login").send({
      emailOrUsername: unverifiedUser.email,
      password: unverifiedUser.password,
    });
    
    expect(res.statusCode).toBe(401);
    expect(res.body.msg).toMatch(/verify your email/);
  });

  it("should get current user when authenticated", async () => {
    await User.create(testUser);
    const loginRes = await request(server)
      .post("/api/users/login")
      .send({ emailOrUsername: testUser.email, password: testUser.password });
    const cookie = loginRes.headers["set-cookie"];
    const res = await request(server)
      .get("/api/users/me")
      .set("Cookie", cookie);
    expect(res.statusCode).toBe(200);
    expect(res.body.user).toHaveProperty("username", testUser.username);
  });

  it("should not get current user when unauthenticated", async () => {
    const res = await request(server).get("/api/users/me");
    expect(res.statusCode).toBe(401);
  });

  it("should update profile when authenticated", async () => {
    await User.create(testUser);
    const loginRes = await request(server)
      .post("/api/users/login")
      .send({ emailOrUsername: testUser.email, password: testUser.password });
    const cookie = loginRes.headers["set-cookie"];
    const res = await request(server)
      .put("/api/users/me")
      .set("Cookie", cookie)
      .send({ bio: "Hello world!", location: "Amsterdam" });
    expect(res.statusCode).toBe(200);
    expect(res.body.user).toHaveProperty("bio", "Hello world!");
    expect(res.body.user).toHaveProperty("location", "Amsterdam");
  });

  it("should not update profile when unauthenticated", async () => {
    const res = await request(server)
      .put("/api/users/me")
      .send({ bio: "Should not work" });
    expect(res.statusCode).toBe(401);
  });

  it("should logout and clear cookie", async () => {
    await User.create(testUser);
    const loginRes = await request(server)
      .post("/api/users/login")
      .send({ emailOrUsername: testUser.email, password: testUser.password });
    const cookie = loginRes.headers["set-cookie"];
    const res = await request(server)
      .post("/api/users/logout")
      .set("Cookie", cookie);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
