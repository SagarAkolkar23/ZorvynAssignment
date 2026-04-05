import { pool } from "../db/db.js";

export const ROLE_PERMISSIONS = {
  owner: [
    "finance:delete",
    "user:manage",
    "record:create",
    "record:update",
    "record:delete",
    "record:read",
    "dashboard:read",
  ],
  admin: [
    "user:manage",
    "record:create",
    "record:update",
    "record:delete",
    "record:read",
    "dashboard:read",
  ],
  analyst: ["record:read", "dashboard:read"],
  viewer: ["dashboard:read"],
};

export const authorize = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const { financeId } = req.params;

      if (!financeId) {
        return res.status(400).json({
          message: "Finance ID is required",
        });
      }

      const result = await pool.query(
        `SELECT role FROM user_finances
         WHERE user_id = $1 AND finance_id = $2`,
        [userId, financeId],
      );

      if (result.rows.length === 0) {
        return res.status(403).json({
          message: "Access denied - Not part of this finance",
        });
      }

      const userRole = result.rows[0].role;

      const permissions = ROLE_PERMISSIONS[userRole] || [];

      if (!permissions.includes(requiredPermission)) {
        return res.status(403).json({
          message: "Access denied - Insufficient permission",
        });
      }

      req.user.role = userRole;

      next();
    } catch (error) {
      next(error);
    }
  };
};

