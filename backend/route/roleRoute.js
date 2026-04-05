import { addUserToFinance, getFinanceUsers, updateUserRole } from "../controller/roleController";
import { protectRoute } from "../middleware/auth";
import { authorize } from "../middleware/authorize";
import { apiLimiter } from "../middleware/rateLimit";
import { getFinanceUsersSchema } from "../validationSchema/authSchema";

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
