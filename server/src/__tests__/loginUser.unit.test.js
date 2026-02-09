import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { loginUser } from "../controllers/user.js";
import User from "../models/User.js";

jest.mock("../models/User.js", () => {
  return {
    __esModule: true,
    default: {
      findOne: jest.fn(),
    },
  };
});

jest.mock("bcrypt", () => ({
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

jest.mock("../util/logging.js", () => ({ logError: jest.fn() }));

describe("loginUser Controller Unit Tests", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "testsecret";
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    };
  });

  const validCreds = { email: "test@test.com", password: "password123" };

  it("should valid inputs", async () => {
    req.body = { email: "test@test.com" }; // Missing password
    await loginUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        msg: "Please provide both email and password",
      }),
    );
  });

  it("should return 401 if user not found", async () => {
    req.body = validCreds;
    User.findOne.mockResolvedValue(null);
    await loginUser(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ msg: "Invalid credentials" }),
    );
  });

  it("should return 401 if password incorrect", async () => {
    req.body = validCreds;
    const mockUser = { _id: "123", password: "hashedPassword" };
    User.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(false);

    await loginUser(req, res);

    expect(bcrypt.compare).toHaveBeenCalledWith(
      validCreds.password,
      mockUser.password,
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ msg: "Invalid credentials" }),
    );
  });

  it("should login successfully if valid", async () => {
    req.body = validCreds;
    const mockUser = {
      _id: "123",
      name: "Test User",
      email: validCreds.email,
      password: "hashedPassword",
      toObject: jest.fn().mockReturnValue({
        // simulate .toObject()
        _id: "123",
        name: "Test User",
        email: validCreds.email,
        password: "hashedPassword",
      }),
    };

    User.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("mockToken");

    await loginUser(req, res);

    expect(jwt.sign).toHaveBeenCalled();
    expect(res.cookie).toHaveBeenCalledWith(
      "token",
      "mockToken",
      expect.objectContaining({
        httpOnly: true,
        maxAge: 3600000,
      }),
    );

    expect(res.status).toHaveBeenCalledWith(200);
    const responseJson = res.json.mock.calls[0][0];
    expect(responseJson.success).toBe(true);
    expect(responseJson.user).toBeDefined();
    expect(responseJson.user.password).toBeUndefined(); // verify sanitization
  });
});
