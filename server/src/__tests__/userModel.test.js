
import User from "../models/User.js";
import {
  connectToMockDB,
  closeMockDatabase,
  clearMockDatabase,
} from "../__testUtils__/dbMock.js";

beforeAll(async () => {
  await connectToMockDB();
});

afterEach(async () => {
  await clearMockDatabase();
});

afterAll(async () => {
  await closeMockDatabase();
});

describe("User Model", () => {
  it("should generate a verification token and set expiry", () => {
    const user = new User({
      username: "testtoken",
      email: "token@test.com",
      password: "password123",
    });

    const token = user.generateVerificationToken();

    expect(token).toBeDefined();
    expect(typeof token).toBe("string");
    expect(user.verificationToken).toBe(token);
    expect(user.verificationTokenExpires).toBeDefined();
    expect(user.verificationTokenExpires.getTime()).toBeGreaterThan(Date.now());
  });

  it("should have default isVerified as false", () => {
    const user = new User({
      username: "testdefault",
      email: "default@test.com",
      password: "password123",
    });

    expect(user.isVerified).toBe(false);
  });
});
