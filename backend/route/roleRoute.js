import { addUserToFinance, getFinanceUsers, updateUserRole } from "../controller/roleController.js";
import { protectRoute } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { apiLimiter } from "../middleware/rateLimit.js";
import { validate } from "../middleware/validate.js";
import { getFinanceUsersSchema } from "../validationSchema/authSchema.js";
import express from "express"
const router = express.Router();


router.post(
  "/:financeId/users",
  protectRoute,
  authorize("user:manage"),
  addUserToFinance,
  apiLimiter,
);

router.put(
  "/:financeId/users/:userId/role",
  protectRoute,
  authorize("user:manage"),
  updateUserRole,
  apiLimiter,
);

router.get(
  "/:financeId/users",
  protectRoute,
  authorize("user:read"),
  validate(getFinanceUsersSchema),
  getFinanceUsers,
  apiLimiter,
);


export default router;
