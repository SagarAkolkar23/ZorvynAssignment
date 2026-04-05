import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { createRecord, deleteRecord, getCategories, getRecords, getUserFinances, updateRecord } from "../controller/recordsController.js";
import { createRecordSchema, deleteRecordSchema, getCategoriesSchema, getRecordsSchema, updateRecordSchema } from "../validationSchema/recordSchema.js";
import { apiLimiter } from "../middleware/rateLimit.js";
import { validate } from "../middleware/validate.js";
import rateLimit from "express-rate-limit";

const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Records
 *   description: Finance records and category management
 */

/**
 * @swagger
 * /zorvyn/my-finances:
 *   get:
 *     summary: Get all finances associated with the user
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User finances fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 finances:
 *                   - id: 1
 *                     name: Personal
 *                     role: owner
 */
router.get("/my-finances", rateLimit, protectRoute, getUserFinances);


/**
 * @swagger
 * /zorvyn/{financeId}/categories:
 *   get:
 *     summary: Get categories for a finance (default + custom)
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: financeId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *     responses:
 *       200:
 *         description: Categories fetched successfully
 */
router.get(
  "/:financeId/categories",
  apiLimiter,
  protectRoute,
  authorize("dashboard:read"),
  validate(getCategoriesSchema),
  getCategories,
);



/**
 * @swagger
 * /zorvyn/{financeId}/records:
 *   post:
 *     summary: Create a new finance record
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: financeId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             amount: 1000
 *             type: expense
 *             categoryId: 1
 *             note: Lunch
 *             date: 2026-04-05
 *     responses:
 *       201:
 *         description: Record created successfully
 */
router.post(
  "/:financeId/records",
  apiLimiter,
  protectRoute,
  authorize("record:create"),
  validate(createRecordSchema),
  createRecord,
);

/**
 * @swagger
 * /zorvyn/records/{recordId}:
 *   put:
 *     summary: Update an existing record
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recordId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           example:
 *             amount: 1500
 *             note: Updated note
 *     responses:
 *       200:
 *         description: Record updated successfully
 */
router.put(
  "/records/:recordId",
  apiLimiter,
  protectRoute,
  authorize("record:update"),
  validate(updateRecordSchema),
  updateRecord,
);


/**
 * @swagger
 * /zorvyn/{financeId}/records:
 *   get:
 *     summary: Get records with filtering, sorting, and pagination
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: financeId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [week, month, year, custom]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [created_at, updated_at]
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Records fetched successfully
 */
router.get(
  "/:financeId/records",
  apiLimiter,
  protectRoute,
  authorize("record:read"),
  validate(getRecordsSchema),
  getRecords,
);


/**
 * @swagger
 * /zorvyn/records/{recordId}:
 *   delete:
 *     summary: Delete a record (admin/owner only)
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recordId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Record deleted successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Record not found
 */
router.delete(
  "/records/:recordId",
  apiLimiter,
  protectRoute,
  authorize("record:delete"),
  validate(deleteRecordSchema),
  deleteRecord,
);

export default router;