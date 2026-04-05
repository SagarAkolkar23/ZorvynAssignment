
import express from "express";
import { registerUser, loginUser } from "../controller/authController.js";
import { loginSchema, registerSchema } from "../validationSchema/authSchema.js";
import { authLimiter } from "../middleware/rateLimit.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

/**
 * @swagger
 * /zorvyn/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Sagar
 *               email:
 *                 type: string
 *                 example: sagar@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       201:
 *         description: User registered successfully
 *       409:
 *         description: User already exists
 */
router.post("/register", validate(registerSchema), authLimiter, registerUser);
router.post("/login", validate(loginSchema), authLimiter, loginUser);

export default router;
