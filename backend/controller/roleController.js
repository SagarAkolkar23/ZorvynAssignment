import { pool } from "../db/db.js";

export const addUserToFinance = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const { financeId } = req.params;
    const { email, role } = req.body;
    const requesterId = req.user.userId;

    if (!email || !role) {
      return res.status(400).json({
        message: "Email and role are required",
      });
    }

    if (!["admin", "analyst", "viewer"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    await client.query("BEGIN");

    const requesterResult = await client.query(
      `SELECT role FROM user_finances
       WHERE user_id = $1 AND finance_id = $2`,
      [requesterId, financeId],
    );

    if (requesterResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(403).json({
        message: "You are not part of this finance",
      });
    }

    const requesterRole = requesterResult.rows[0].role;

    const ROLE_ASSIGNMENT = {
      owner: ["admin", "analyst", "viewer"],
      admin: ["analyst", "viewer"],
    };

    const allowedRoles = ROLE_ASSIGNMENT[requesterRole] || [];

    if (!allowedRoles.includes(role)) {
      await client.query("ROLLBACK");
      return res.status(403).json({
        message: "You are not allowed to assign this role",
      });
    }

    const userResult = await client.query(
      `SELECT id FROM users WHERE email = $1`,
      [email],
    );

    if (userResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        message: "User with this email does not exist",
      });
    }

    const targetUserId = userResult.rows[0].id;

    const existing = await client.query(
      `SELECT id FROM user_finances
       WHERE user_id = $1 AND finance_id = $2`,
      [targetUserId, financeId],
    );

    if (existing.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        message: "User already part of this finance",
      });
    }

    await client.query(
      `INSERT INTO user_finances (user_id, finance_id, role)
       VALUES ($1, $2, $3)`,
      [targetUserId, financeId, role],
    );

    await client.query("COMMIT");

    return res.status(201).json({
      message: `User added as ${role}`,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release();
  }
};


export const updateUserRole = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const { financeId, userId } = req.params;
    const { role } = req.body;
    const requesterId = req.user.userId;

    if (!role) {
      return res.status(400).json({
        message: "Role is required",
      });
    }

    if (!["admin", "analyst", "viewer"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    await client.query("BEGIN");

    const requesterResult = await client.query(
      `SELECT role FROM user_finances
       WHERE user_id = $1 AND finance_id = $2`,
      [requesterId, financeId]
    );

    if (requesterResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(403).json({
        message: "You are not part of this finance",
      });
    }

    const requesterRole = requesterResult.rows[0].role;

    const targetResult = await client.query(
      `SELECT role FROM user_finances
       WHERE user_id = $1 AND finance_id = $2`,
      [userId, financeId]
    );

    if (targetResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        message: "Target user not found in this finance",
      });
    }

    const targetRole = targetResult.rows[0].role;

    if (role === "owner") {
      await client.query("ROLLBACK");
      return res.status(403).json({
        message: "Cannot assign owner role",
      });
    }

    if (requesterId === userId) {
      await client.query("ROLLBACK");
      return res.status(403).json({
        message: "You cannot change your own role",
      });
    }

    const ROLE_UPDATE = {
      owner: ["admin", "analyst", "viewer"],
      admin: ["analyst", "viewer"],
    };

    const allowedRoles = ROLE_UPDATE[requesterRole] || [];

    if (!allowedRoles.includes(role)) {
      await client.query("ROLLBACK");
      return res.status(403).json({
        message: "You are not allowed to assign this role",
      });
    }

    if (requesterRole === "admin" && ["admin", "owner"].includes(targetRole)) {
      await client.query("ROLLBACK");
      return res.status(403).json({
        message: "Admin cannot modify this user",
      });
    }

    await client.query(
      `UPDATE user_finances
       SET role = $1
       WHERE user_id = $2 AND finance_id = $3`,
      [role, userId, financeId]
    );

    await client.query("COMMIT");

    return res.json({
      message: "User role updated successfully",
    });

  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release();
  }
};