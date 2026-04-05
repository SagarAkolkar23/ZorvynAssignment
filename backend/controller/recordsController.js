import { pool } from "../db/db.js";

export const getCategories = async (req, res, next) => {
  try {
    const { financeId } = req.params;
    const { type } = req.query;

    if (!type) {
      return res.status(400).json({
        message: "Type (income/expense) is required",
      });
    }

    const result = await pool.query(
      `SELECT id, name, type, is_default
       FROM categories
       WHERE type = $1
       AND (is_default = true OR finance_id = $2)
       ORDER BY is_default DESC, name ASC`,
      [type, financeId],
    );

    return res.json({
      categories: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const createRecord = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const { financeId } = req.params;
    const { amount, type, categoryId, newCategory, note, date } = req.body;
    const userId = req.user.userId;

    if (!amount || !type || !date) {
      return res.status(400).json({
        message: "Amount, type and date are required",
      });
    }

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({
        message: "Invalid type",
      });
    }

    await client.query("BEGIN");

    let finalCategoryId = categoryId;

    if (!finalCategoryId && newCategory) {
      const existing = await client.query(
        `SELECT id FROM categories
         WHERE LOWER(name) = LOWER($1)
         AND type = $2
         AND (finance_id = $3 OR is_default = true)
         LIMIT 1`,
        [newCategory, type, financeId],
      );

      if (existing.rows.length > 0) {
        finalCategoryId = existing.rows[0].id;
      } else {
        const newCat = await client.query(
          `INSERT INTO categories (name, type, is_default, finance_id)
           VALUES ($1, $2, false, $3)
           RETURNING id`,
          [newCategory, type, financeId],
        );

        finalCategoryId = newCat.rows[0].id;
      }
    }

    if (!finalCategoryId) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "Category is required",
      });
    }

    const recordResult = await client.query(
      `INSERT INTO records 
       (finance_id, category_id, amount, type, note, date, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [financeId, finalCategoryId, amount, type, note, date, userId],
    );

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Record created successfully",
      record: recordResult.rows[0],
    });
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
    const { recordId } = req.params;
    const { amount, categoryId, newCategory, note, date } = req.body;

    await client.query("BEGIN");

    const existingRecord = await client.query(
      `SELECT * FROM records WHERE id = $1`,
      [recordId],
    );

    if (existingRecord.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        message: "Record not found",
      });
    }

    const record = existingRecord.rows[0];

    let finalCategoryId = categoryId || record.category_id;
    const type = record.type;
    const financeId = record.finance_id;

    if (!categoryId && newCategory) {
      const normalizedCategory = newCategory.trim();

      const existing = await client.query(
        `SELECT id FROM categories
         WHERE LOWER(name) = LOWER($1)
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

    return res.json({
      message: "Record updated successfully",
      record: updated.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release();
  }
};
