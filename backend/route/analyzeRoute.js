import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";

import { getCategoryBreakdown, getCategoryTrends, getFinanceSummary, getTrends } from "../controller/analyzeController.js";

const router = express.Router();

router.get(
  "/:financeId/summary",
  protectRoute,
  authorize("dashboard:read"),
  getFinanceSummary,
);

router.get(
  "/:financeId/analytics/categories",
  protectRoute,
  authorize("dashboard:read"),
  getCategoryBreakdown,
);

router.get(
  "/:financeId/analytics/trends",
  protectRoute,
  authorize("dashboard:read"),
  getTrends,
);

router.get(
  "/:financeId/analytics/category-trends",
  protectRoute,
  authorize("dashboard:read"),
  getCategoryTrends,
);

export default router;
