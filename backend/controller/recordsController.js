import { pool } from "../db/db.js";
import { successResponse } from "../utils/response.js";


export const getUserFinances = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `
      SELECT 
        f.id,
        f.name,
        f.created_by,
        f.created_at,
        uf.role
      FROM user_finances uf
      JOIN finances f ON uf.finance_id = f.id
      WHERE uf.user_id = $1
      ORDER BY f.created_at DESC
      `,
      [userId]
    );

    return successResponse(
      res,
      { finances: result.rows },
      "User finances fetched successfully"
    );

  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const { financeId } = req.validated.params;
    const { type } = req.validated.query;

    const result = await pool.query(
      `SELECT id, name, type, is_default
       FROM categories
       WHERE type = $1
       AND (is_default = true OR finance_id = $2)
       ORDER BY is_default DESC, name ASC`,
      [type, financeId],
    );

    return successResponse(
      res,
      { categories: result.rows },
      "Categories fetched successfully",
    );
  } catch (error) {
    next(error);
  }
};

export const createRecord = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const { financeId } = req.validated.params;
    const { amount, type, categoryId, newCategory, note, date } =
      req.validated.body;
    const userId = req.user.userId;

    await client.query("BEGIN");

    let finalCategoryId = categoryId;

    if (!finalCategoryId && newCategory) {
      const normalizedCategory = newCategory.trim().toLowerCase();

      const existing = await client.query(
        `SELECT id FROM categories
         WHERE LOWER(name) = $1
         AND type = $2
         AND (finance_id = $3 OR is_default = true)
         LIMIT 1`,
        [normalizedCategory, type, financeId],
      );

      if (existing.rows.length > 0) {
        finalCategoryId = existing.rows[0].id;
      } else {
        const newCat = await client.query(
          `INSERT INTO categories (name, type, is_default, finance_id)
           VALUES ($1, $2, false, $3)
           RETURNING id`,
          [normalizedCategory, type, financeId],
        );

        finalCategoryId = newCat.rows[0].id;
      }
    }

    if (!finalCategoryId) {
      const err = new Error("Category is required");
      err.status = 400;
      err.code = "VALIDATION_ERROR";
      throw err;
    }

    const recordResult = await client.query(
      `INSERT INTO records 
       (finance_id, category_id, amount, type, note, date, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [financeId, finalCategoryId, amount, type, note, date, userId],
    );

    await client.query("COMMIT");

    return successResponse(
      res,
      { record: recordResult.rows[0] },
      "Record created successfully",
      201,
    );
  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release();
  }
};

export const updateRecord = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const { recordId } = req.validated.params;
    const { amount, categoryId, newCategory, note, date } = req.validated.body;

    await client.query("BEGIN");

    const existingRecord = await client.query(
      `SELECT * FROM records WHERE id = $1`,
      [recordId],
    );

    if (existingRecord.rows.length === 0) {
      const err = new Error("Record not found");
      err.status = 404;
      err.code = "NOT_FOUND";
      throw err;
    }

    const record = existingRecord.rows[0];

    let finalCategoryId = categoryId || record.category_id;
    const type = record.type;
    const financeId = record.finance_id;

    if (!categoryId && newCategory) {
      const normalizedCategory = newCategory.trim().toLowerCase();

      const existing = await client.query(
        `SELECT id FROM categories
         WHERE LOWER(name) = $1
         AND type = $2
         AND (finance_id = $3 OR is_default = true)
         LIMIT 1`,
        [normalizedCategory, type, financeId],
      );

      if (existing.rows.length > 0) {
        finalCategoryId = existing.rows[0].id;
      } else {
        const newCat = await client.query(
          `INSERT INTO categories (name, type, is_default, finance_id)
           VALUES ($1, $2, false, $3)
           RETURNING id`,
          [normalizedCategory, type, financeId],
        );

        finalCategoryId = newCat.rows[0].id;
      }
    }

    const updated = await client.query(
      `UPDATE records
       SET 
         amount = COALESCE($1, amount),
         category_id = COALESCE($2, category_id),
         note = COALESCE($3, note),
         date = COALESCE($4, date),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [amount, finalCategoryId, note, date, recordId],
    );

    await client.query("COMMIT");

    return successResponse(
      res,
      { record: updated.rows[0] },
      "Record updated successfully",
    );
  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release();
  }
};


export const getRecords = async (req, res, next) => {
  try {
    const { financeId } = req.validated.params;
    const {
      type,
      filter,
      startDate,
      endDate,
      sortBy = "created_at",
      order = "desc",
      page,
      limit,
    } = req.validated.query;

    const offset = (page - 1) * limit;

    let baseQuery = `
      FROM records r
      LEFT JOIN categories c ON r.category_id = c.id
      LEFT JOIN users u ON r.created_by = u.id
      WHERE r.finance_id = $1
    `;

    let values = [financeId];
    let index = 2;

    if (type) {
      baseQuery += ` AND r.type = $${index++}`;
      values.push(type);
    }

    const { clause, values: dateValues } = buildDateFilter({
      filter,
      startDate,
      endDate,
      startIndex: index,
    });

    baseQuery += ` ${clause}`;
    values.push(...dateValues);

    const countResult = await pool.query(
      `SELECT COUNT(*) ${baseQuery}`,
      values
    );

    const total = Number(countResult.rows[0].count);

    const safeSort = ["created_at", "updated_at"].includes(sortBy)
      ? sortBy
      : "created_at";

    const safeOrder = order === "asc" ? "ASC" : "DESC";

    const dataQuery = `
      SELECT 
        r.id,
        r.amount,
        r.type,
        r.note,
        r.date,
        r.created_at,
        r.updated_at,
        c.name AS category,
        u.name AS created_by
      ${baseQuery}
      ORDER BY r.${safeSort} ${safeOrder}
      LIMIT $${index++} OFFSET $${index}
   `;

    const dataResult = await pool.query(dataQuery, [
      ...values,
      limit,
      offset,
    ]);

    return successResponse(
      res,
      {
        records: dataResult.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Records fetched successfully"
    );

  } catch (error) {
    next(error);
  }
};

export const deleteRecord = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const { recordId } = req.validated.params;
    const userId = req.user.userId;

    await client.query("BEGIN");

    // 🔹 1. Get record
    const recordResult = await client.query(
      `SELECT finance_id FROM records WHERE id = $1`,
      [recordId]
    );

    if (recordResult.rows.length === 0) {
      const err = new Error("Record not found");
      err.status = 404;
      err.code = "NOT_FOUND";
      throw err;
    }

    const financeId = recordResult.rows[0].finance_id;

    // 🔹 2. Check user role in this finance
    const roleResult = await client.query(
      `SELECT role FROM user_finances
       WHERE user_id = $1 AND finance_id = $2`,
      [userId, financeId]
    );

    if (roleResult.rows.length === 0) {
      const err = new Error("You are not part of this finance");
      err.status = 403;
      err.code = "FORBIDDEN";
      throw err;
    }

    const role = roleResult.rows[0].role;

    if (!["owner", "admin"].includes(role)) {
      const err = new Error("You are not allowed to delete records");
      err.status = 403;
      err.code = "FORBIDDEN";
      throw err;
    }

    // 🔹 3. Delete record
    await client.query(
      `DELETE FROM records WHERE id = $1`,
      [recordId]
    );

    await client.query("COMMIT");

    return successResponse(
      res,
      {},
      "Record deleted successfully"
    );

  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release();
  }
};
