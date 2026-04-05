import { addUserToFinance, getFinanceUsers, updateUserRole } from "../controller/roleController.js";
import { protectRoute } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { apiLimiter } from "../middleware/rateLimit.js";
import { validate } from "../middleware/validate.js";
import { getFinanceUsersSchema } from "../validationSchema/authSchema.js";
import express from "express"
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users & Roles
 *   description: Manage users and roles in a finance
 */

/**
 * @swagger
 * /zorvyn/{financeId}/users:
 *   post:
 *     summary: Add a user to a finance with a role
 *     tags: [Users & Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: financeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Finance ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             email: "user@example.com"
 *             role: "analyst"
 *     responses:
 *       201:
 *         description: User added successfully
 *         content:
 *           application/json:
 *             example:
 *               message: User added as analyst
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Not allowed to assign role
 *       404:
 *         description: User not found
 *       409:
 *         description: User already exists in finance
 */
router.post(
  "/:financeId/users",
  apiLimiter,
  protectRoute,
  authorize("user:manage"),
  addUserToFinance,
);


/**
 * @swagger
 * /zorvyn/{financeId}/users/{userId}/role:
 *   put:
 *     summary: Update role of a user in a finance
 *     tags: [Users & Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: financeId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             role: "viewer"
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       400:
 *         description: Invalid role
 *       403:
 *         description: Permission denied
 *       404:
 *         description: User not found
 */
router.put(
  "/:financeId/users/:userId/role",
  apiLimiter,
  protectRoute,
  authorize("user:manage"),
  updateUserRole,
);

/**
 * @swagger
 * /zorvyn/{financeId}/users:
 *   get:
 *     summary: Get all users of a finance with roles
 *     tags: [Users & Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: financeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Finance users fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 users:
 *                   - id: 1
 *                     name: Sagar
 *                     email: sagar@example.com
 *                     role: owner
 *       403:
 *         description: Not part of this finance
 */
router.get(
  "/:financeId/users",
  apiLimiter,
  protectRoute,
  authorize("user:read"),
  validate(getFinanceUsersSchema),
  getFinanceUsers,
);


export default router;
