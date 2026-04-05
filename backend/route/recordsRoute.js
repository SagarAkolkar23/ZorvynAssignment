import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { createRecord, deleteRecord, getCategories, getRecords, getUserFinances, updateRecord } from "../controller/recordsController.js";
import { createRecordSchema, deleteRecordSchema, getCategoriesSchema, getRecordsSchema, updateRecordSchema } from "../validationSchema/recordSchema.js";
import { apiLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

router.get("/my-finances", protectRoute, getUserFinances);

router.get(
  "/:financeId/categories",
  protectRoute,
  authorize("dashboard:read"),
  validate(getCategoriesSchema),
  getCategories,
  apiLimiter,
);

router.post(
  "/:financeId/records",
  protectRoute,
  authorize("record:create"),
  validate(createRecordSchema),
  createRecord,
  apiLimiter,
);

router.put(
  "/records/:recordId",
  protectRoute,
  authorize("record:update"),
  validate(updateRecordSchema),
  updateRecord,
  apiLimiter,
);

router.get(
  "/:financeId/records",
  protectRoute,
  authorize("record:read"),
  validate(getRecordsSchema),
  getRecords,
  apiLimiter,
);

router.delete(
  "/records/:recordId",
  protectRoute,
  authorize("record:delete"),
  validate(deleteRecordSchema),
  deleteRecord,
  apiLimiter,
);

export default router;