// src/middlewares/rateLimit.middleware.js

import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10, 
  message: {
    success: false,
    error: {
      message: "Too many login attempts. Try again later.",
      code: "RATE_LIMIT_EXCEEDED",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, 
  message: {
    success: false,
    error: {
      message: "Too many requests. Please slow down.",
      code: "RATE_LIMIT_EXCEEDED",
    },
  },
});
