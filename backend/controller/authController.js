import { pool } from "../db/db.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { generateToken } from "../utils/jwt.js";
import { successResponse } from "../utils/response.js";

export const registerUser = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const { name, email, password } = req.validated.body;

    await client.query("BEGIN");

    const existingUser = await client.query(
      `SELECT id FROM users WHERE email = $1`,
      [email.toLowerCase()],
    );

    if (existingUser.rows.length > 0) {
      const err = new Error("User already exists");
      err.status = 409;
      err.code = "CONFLICT_ERROR";
      throw err;
    }

    const hashedPassword = await hashPassword(password);

    const userResult = await client.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`,
      [name, email.toLowerCase(), hashedPassword],
    );

    const user = userResult.rows[0];

    const financeResult = await client.query(
      `INSERT INTO finances (name, created_by)
       VALUES ($1, $2)
       RETURNING *`,
      [`${name}'s Finance`, user.id],
    );

    const finance = financeResult.rows[0];

    await client.query(
      `INSERT INTO user_finances (user_id, finance_id, role)
       VALUES ($1, $2, 'owner')`,
      [user.id, finance.id],
    );

    await client.query("COMMIT");

    const token = generateToken({ userId: user.id });

    return successResponse(
      res,
      { token, user, finance },
      "User registered successfully",
      201,
    );
  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release();
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.validated.body;

    const userResult = await pool.query(
      `SELECT id, name, email, password FROM users WHERE email = $1`,
      [email.toLowerCase()],
    );

    if (userResult.rows.length === 0) {
      const err = new Error("Invalid credentials");
      err.status = 401;
      err.code = "AUTH_ERROR";
      throw err;
    }

    const user = userResult.rows[0];

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      const err = new Error("Invalid credentials");
      err.status = 401;
      err.code = "AUTH_ERROR";
      throw err;
    }

    const token = generateToken({ userId: user.id });

    return successResponse(
      res,
      {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      "Login successful",
    );
  } catch (error) {
    next(error);
  }
};