
import express from "express";
import { registerUser, loginUser } from "../controller/authController.js";
import { loginSchema, registerSchema } from "../validationSchema/authSchema.js";
import { authLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

router.post("/register", validate(registerSchema), authLimiter, registerUser);
router.post("/login", validate(loginSchema), authLimiter, loginUser);

export default router;
