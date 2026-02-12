/* eslint-disable no-unused-vars */
import logger from "../util/logging.js";

export const errorHandler = (err, req, res, next) => {
  logger.error(err.message, {
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  const statusCode = err.statusCode || 500;
  const message = err.isPublic ? err.message : "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    msg: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
