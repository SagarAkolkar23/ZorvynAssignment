import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";

import { getCategoryBreakdown, getCategoryTrends, getFinanceSummary, getTrends } from "../controller/analyzeController.js";
import { validate } from "../middleware/validate.js";
import { financeIdParam, summaryQuerySchema, typeQuerySchema } from "../validationSchema/analyzeSchema.js";
import { apiLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

router.get(
  "/:financeId/summary",
  protectRoute,
  authorize("dashboard:read"),
  validate(financeIdParam.merge(summaryQuerySchema)),
  getFinanceSummary,
  apiLimiter,
);

router.get(
  "/:financeId/analytics/categories",
  protectRoute,
  authorize("dashboard:read"),
  validate(financeIdParam.merge(typeQuerySchema)),
  apiLimiter,
  getCategoryBreakdown,
);

router.get(
  "/:financeId/analytics/trends",
  protectRoute,
  authorize("dashboard:read"),
  getTrends,
  apiLimiter,
);

router.get(
  "/:financeId/analytics/category-trends",
  protectRoute,
  authorize("dashboard:read"),
  getCategoryTrends,
  apiLimiter,
);

export default router;
