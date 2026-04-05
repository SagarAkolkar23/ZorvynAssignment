
import express from "express";
import { registerUser, loginUser } from "../controller/authController.js";
import { loginSchema, registerSchema } from "../validationSchema/authSchema.js";

const router = express.Router();

router.post("/register",validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);

export default router;
