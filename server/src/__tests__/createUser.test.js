import supertest from "supertest";

import {
  connectToMockDB,
  closeMockDatabase,
  clearMockDatabase,
} from "../__testUtils__/dbMock.js";
import app from "../app.js";
import { findUserInMockDB } from "../__testUtils__/userMocks.js";

const request = supertest(app);

beforeAll(async () => {
  await connectToMockDB();
});

afterEach(async () => {
  await clearMockDatabase();
});

afterAll(async () => {
  await closeMockDatabase();
});

const testUserBase = {
  name: "John",
  email: "john@doe.com",
  password: "password123",
  city: "Amsterdam",
  country: "Netherlands",
  bio: "Hello",
};

describe("POST /api/users", () => {
  it("Should return a bad request if no user object is given", async () => {
    const response = await request.post("/api/users");
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.msg.length).not.toBe(0);
  });

  it("Should return a bad request if the user object does not have a name", async () => {
    const testUser = { ...testUserBase };
    delete testUser.name;
    const response = await request.post("/api/users").send({ user: testUser });
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.msg).toContain("name");
  });

  it("Should return a bad request if the user object does not have an email", async () => {
    const testUser = { ...testUserBase };
    delete testUser.email;
    const response = await request.post("/api/users").send({ user: testUser });
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.msg).toContain("email");
  });

  it("Should return a bad request if the user object does not have a password", async () => {
    const testUser = { ...testUserBase };
    delete testUser.password;
    const response = await request.post("/api/users").send({ user: testUser });
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.msg).toContain("password");
  });

  it("Should return a bad request if the user object does not have a city", async () => {
    const testUser = { ...testUserBase };
    delete testUser.city;
    const response = await request.post("/api/users").send({ user: testUser });
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.msg).toContain("city");
  });

  it("Should return a bad request if the user object does not have a country", async () => {
    const testUser = { ...testUserBase };
    delete testUser.country;
    const response = await request.post("/api/users").send({ user: testUser });
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.msg).toContain("country");
  });

  it("Should return a bad request if the user object has extra fields", async () => {
    const testUser = { ...testUserBase, foo: "bar" };
    const response = await request.post("/api/users").send({ user: testUser });
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.msg).toContain("foo");
  });

  it("Should return a success state if a correct user is given and verify password hashing", async () => {
    const response = await request
      .post("/api/users")
      .send({ user: testUserBase });
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);

    const { user } = response.body;
    expect(user.name).toEqual(testUserBase.name);
    expect(user.email).toEqual(testUserBase.email);
    // Password should trigger be removed from response
    expect(user.password).toBeUndefined();

    // Check DB for hashing
    const userInDb = await findUserInMockDB(user._id);
    expect(userInDb.name).toEqual(testUserBase.name);
    expect(userInDb.email).toEqual(testUserBase.email);
    expect(userInDb.password).not.toEqual(testUserBase.password); // Should be hashed
    expect(userInDb.password).toMatch(/^\$2b\$/); // bcrypt hash format
  });

  it("Should failing if email already exists", async () => {
    // effective only because we clear DB between tests, otherwise we need a unique email
    await request.post("/api/users").send({ user: testUserBase });

    const response = await request
      .post("/api/users")
      .send({ user: testUserBase });
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.msg).toEqual("Email already in use");
  });
});
