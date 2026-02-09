import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import auth from "../middleware/auth.js";

jest.mock("jsonwebtoken");
jest.mock("../util/logging.js", () => ({ logError: jest.fn() }));

describe("Auth Middleware Unit Tests", () => {
  let req, res, next;

  beforeEach(() => {
    req = { cookies: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    process.env.JWT_SECRET = "testsecret";
  });

  it("should return 401 if token is missing", () => {
    auth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ msg: "Auth token not found" }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if token is invalid", () => {
    req.cookies.token = "invalidToken";
    jwt.verify.mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    auth(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(
      "invalidToken",
      process.env.JWT_SECRET,
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ msg: "Invalid token" }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next if token is valid", () => {
    req.cookies.token = "validToken";
    const decodedUser = { id: 123 };
    jwt.verify.mockReturnValue(decodedUser);

    auth(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(
      "validToken",
      process.env.JWT_SECRET,
    );
    expect(req.user).toEqual(decodedUser);
    expect(next).toHaveBeenCalled();
  });
});
