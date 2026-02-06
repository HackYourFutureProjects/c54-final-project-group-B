// Increase Jest timeout for integration tests (mongodb-memory-server can be slow)
jest.setTimeout(30000);

const testUser = {
  username: "testuser1",
  email: "testuser1@example.com",
  password: "testpassword123",
};

let server;

describe("Auth API", () => {
  beforeAll(async () => {
    server = app.listen(0);
    await User.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
    server.close();
  });

  it("should sign up a new user", async () => {
    const res = await request(server).post("/api/users/signup").send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toHaveProperty("username", testUser.username);
    expect(res.body.user).not.toHaveProperty("password");
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("should not sign up with duplicate email or username", async () => {
    const res = await request(server).post("/api/users/signup").send(testUser);
    expect(res.statusCode).toBe(409);
  });

  it("should login with username", async () => {
    const res = await request(server).post("/api/users/login").send({
      emailOrUsername: testUser.username,
      password: testUser.password,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("should login with email", async () => {
    const res = await request(server)
      .post("/api/users/login")
      .send({ emailOrUsername: testUser.email, password: testUser.password });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("should not login with wrong password", async () => {
    const res = await request(server)
      .post("/api/users/login")
      .send({ emailOrUsername: testUser.email, password: "wrongpass" });
    expect(res.statusCode).toBe(401);
  });

  it("should get current user when authenticated", async () => {
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
