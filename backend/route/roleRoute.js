import { addUserToFinance, updateUserRole } from "../controller/roleController";
import { protectRoute } from "../middleware/auth";
import { authorize } from "../middleware/authorize";

const router = express.Router();


router.post(
  "/:financeId/users",
  protectRoute,
  authorize("user:manage"),
  addUserToFinance,
);

router.put(
  "/:financeId/users/:userId/role",
  protectRoute,
  authorize("user:manage"),
  updateUserRole,
);

export default router;
