import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";

import { getCategoryBreakdown, getCategoryTrends, getFinanceSummary, getTrends } from "../controller/analyzeController.js";
import { validate } from "../middleware/validate.js";
import { financeIdParam, summaryQuerySchema, typeQuerySchema } from "../validationSchema/analyzeSchema.js";
import { apiLimiter } from "../middleware/rateLimit.js";

const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Analysis
 *   description: Finance analytics and insights APIs
 */


/**
 * @swagger
 * /zorvyn/{financeId}/summary:
 *   get:
 *     summary: Get finance summary (income, expense, net balance)
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: financeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Finance ID
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [week, month, year, custom]
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Finance summary fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Finance summary fetched successfully
 *               data:
 *                 totalIncome: 50000
 *                 totalExpense: 20000
 *                 netBalance: 30000
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/:financeId/summary",
  apiLimiter,
  protectRoute,
  authorize("dashboard:read"),
  validate(financeIdParam.merge(summaryQuerySchema)),
  getFinanceSummary,
);


/**
 * @swagger
 * /zorvyn/{financeId}/analytics/categories:
 *   get:
 *     summary: Get category-wise breakdown (income/expense)
 *     tags: [Analysis]
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
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [week, month, year, custom]
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Category breakdown fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 type: expense
 *                 breakdown:
 *                   - category_id: 1
 *                     category_name: Food
 *                     total_amount: 5000
 */
router.get(
  "/:financeId/analytics/categories",
  apiLimiter,
  protectRoute,
  authorize("dashboard:read"),
  validate(financeIdParam.merge(typeQuerySchema)),
  getCategoryBreakdown,
);

/**
 * @swagger
 * /zorvyn/{financeId}/analytics/trends:
 *   get:
 *     summary: Get income vs expense trends
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: financeId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: filter
 *         required: true
 *         schema:
 *           type: string
 *           enum: [week, month, year]
 *     responses:
 *       200:
 *         description: Trends fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 filter: month
 *                 data:
 *                   - label: "2026-04-01"
 *                     income: 2000
 *                     expense: 1000
 */
router.get(
  "/:financeId/analytics/trends",
  apiLimiter,
  protectRoute,
  authorize("dashboard:read"),
  getTrends,
);

/**
 * @swagger
 * /zorvyn/{financeId}/analytics/category-trends:
 *   get:
 *     summary: Get category trends over time
 *     tags: [Analysis]
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
 *       - in: query
 *         name: filter
 *         required: true
 *         schema:
 *           type: string
 *           enum: [week, month, year]
 *     responses:
 *       200:
 *         description: Category trends fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 type: expense
 *                 filter: week
 *                 data:
 *                   - label: "2026-04-01"
 *                     categories:
 *                       - name: Food
 *                         amount: 500
 */
router.get(
  "/:financeId/analytics/category-trends",
  apiLimiter,
  protectRoute,
  authorize("dashboard:read"),
  getCategoryTrends,
);

export default router;
