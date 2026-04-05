import { pool } from "../db/db.js";
import { buildDateFilter } from "../utils/buildDateFilter.js";
import { successResponse } from "../utils/response.js";

export const getFinanceSummary = async (req, res, next) => {
  try {
    const { financeId } = req.validated.params;
    const { filter, startDate, endDate } = req.validated.query;

    const { clause, values } = buildDateFilter({
      filter,
      startDate,
      endDate,
      startIndex: 2,
    });

    const result = await pool.query(
      `
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount END), 0) AS total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount END), 0) AS total_expense
      FROM records
      WHERE finance_id = $1
      ${clause}
      `,
      [financeId, ...values],
    );

    const totalIncome = Number(result.rows[0].total_income);
    const totalExpense = Number(result.rows[0].total_expense);

    return successResponse(
      res,
      {
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense,
      },
      "Finance summary fetched successfully",
    );
  } catch (error) {
    next(error);
  }
};

export const getCategoryBreakdown = async (req, res, next) => {
  try {
    const { financeId } = req.validated.params;
    const { type, filter, startDate, endDate } = req.validated.query;

    const { clause, values } = buildDateFilter({
      filter,
      startDate,
      endDate,
      startIndex: 3,
    });

    const result = await pool.query(
      `
      SELECT 
        c.id AS category_id,
        c.name AS category_name,
        COALESCE(SUM(r.amount), 0) AS total_amount
      FROM records r
      LEFT JOIN categories c ON r.category_id = c.id
      WHERE r.finance_id = $1
      AND r.type = $2
      ${clause}
      GROUP BY c.id, c.name
      ORDER BY total_amount DESC
      `,
      [financeId, type, ...values],
    );

    return successResponse(
      res,
      { type, breakdown: result.rows },
      "Category breakdown fetched successfully",
    );
  } catch (error) {
    next(error);
  }
};

export const getTrends = async (req, res, next) => {
  try {
    const { financeId } = req.validated.params;
    const { filter } = req.validated.query;

    let groupBy = "";
    let dateCondition = "";
    let labelFormat = "";

    switch (filter) {
      case "week":
        groupBy = "DATE(date)";
        dateCondition = `date >= CURRENT_DATE - INTERVAL '7 days'`;
        labelFormat = "YYYY-MM-DD";
        break;

      case "month":
        groupBy = "DATE(date)";
        dateCondition = `date >= DATE_TRUNC('month', CURRENT_DATE)`;
        labelFormat = "YYYY-MM-DD";
        break;

      case "year":
        groupBy = "DATE_TRUNC('month', date)";
        dateCondition = `date >= DATE_TRUNC('year', CURRENT_DATE)`;
        labelFormat = "YYYY-MM";
        break;

      default:
        const err = new Error("Invalid filter");
        err.status = 400;
        err.code = "VALIDATION_ERROR";
        throw err;
    }

    const result = await pool.query(
      `
      SELECT 
        TO_CHAR(${groupBy}, '${labelFormat}') AS label,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount END), 0) AS income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount END), 0) AS expense
      FROM records
      WHERE finance_id = $1
      AND ${dateCondition}
      GROUP BY ${groupBy}
      ORDER BY ${groupBy} ASC
      `,
      [financeId],
    );

    return successResponse(
      res,
      { filter, data: result.rows },
      "Trends fetched successfully",
    );
  } catch (error) {
    next(error);
  }
};

export const getCategoryTrends = async (req, res, next) => {
  try {
    const { financeId } = req.validated.params;
    const { type, filter } = req.validated.query;

    let groupBy = "";
    let dateCondition = "";
    let labelFormat = "";

    switch (filter) {
      case "week":
        groupBy = "DATE(r.date)";
        dateCondition = `r.date >= CURRENT_DATE - INTERVAL '7 days'`;
        labelFormat = "YYYY-MM-DD";
        break;

      case "month":
        groupBy = "DATE(r.date)";
        dateCondition = `r.date >= DATE_TRUNC('month', CURRENT_DATE)`;
        labelFormat = "YYYY-MM-DD";
        break;

      case "year":
        groupBy = "DATE_TRUNC('month', r.date)";
        dateCondition = `r.date >= DATE_TRUNC('year', CURRENT_DATE)`;
        labelFormat = "YYYY-MM";
        break;

      default:
        const err = new Error("Invalid filter");
        err.status = 400;
        err.code = "VALIDATION_ERROR";
        throw err;
    }

    const result = await pool.query(
      `
      SELECT 
        TO_CHAR(${groupBy}, '${labelFormat}') AS label,
        c.name AS category,
        COALESCE(SUM(r.amount), 0) AS total_amount
      FROM records r
      LEFT JOIN categories c ON r.category_id = c.id
      WHERE r.finance_id = $1
      AND r.type = $2
      AND ${dateCondition}
      GROUP BY label, c.name
      ORDER BY label ASC
      `,
      [financeId, type],
    );

    const grouped = {};

    result.rows.forEach((row) => {
      if (!grouped[row.label]) grouped[row.label] = [];

      grouped[row.label].push({
        name: row.category,
        amount: Number(row.total_amount),
      });
    });

    const formatted = Object.keys(grouped).map((label) => ({
      label,
      categories: grouped[label],
    }));

    return successResponse(
      res,
      { type, filter, data: formatted },
      "Category trends fetched successfully",
    );
  } catch (error) {
    next(error);
  }
};