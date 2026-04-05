
import express from "express";
import { registerUser, loginUser } from "../controller/authController.js";
import { loginSchema, registerSchema } from "../validationSchema/authSchema.js";
import { authLimiter } from "../middleware/rateLimit.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Login and Register
 */


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
router.post("/register", authLimiter, validate(registerSchema), registerUser);

/**
 * @swagger
 * /zorvyn/login:
 *   post:
 *     summary: Login user and generate JWT token
 *     tags: [Auth]
 *     description: Authenticates user using email and password and returns a JWT token for authorized requests.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: sagar@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: 123
 *                         name:
 *                           type: string
 *                           example: Sagar
 *                         email:
 *                           type: string
 *                           example: sagar@gmail.com
 *       401:
 *         description: Invalid credentials
 *       429:
 *         description: Too many requests (rate limit exceeded)
 */
router.post("/login", validate(loginSchema), authLimiter, loginUser);

export default router;
