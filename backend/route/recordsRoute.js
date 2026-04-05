import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { createRecord, getCategories, updateRecord } from "../controller/recordsController.js";

const router = express.Router();

router.get(
  "/:financeId/categories",
  protectRoute,
  authorize("dashboard:read"),
  getCategories,
);

router.post(
  "/:financeId/records",
  protectRoute,
  authorize("record:create"),
  createRecord,
);

router.put(
  "/records/:recordId",
  protectRoute,
  authorize("record:update"),
  updateRecord,
);

export default router;