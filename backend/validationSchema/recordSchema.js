// src/validations/record.schema.js

import { z } from "zod";

export const getCategoriesSchema = z.object({
  params: z.object({
    financeId: z.string().uuid(),
  }),
  query: z.object({
    type: z.enum(["income", "expense"]),
  }),
});

export const createRecordSchema = z.object({
  params: z.object({
    financeId: z.string().uuid(),
  }),
  body: z.object({
    amount: z.number().positive(),
    type: z.enum(["income", "expense"]),
    categoryId: z.string().uuid().optional(),
    newCategory: z.string().min(1).optional(),
    note: z.string().optional(),
    date: z.string(), // can refine later
  }),
});

export const updateRecordSchema = z.object({
  params: z.object({
    recordId: z.string().uuid(),
  }),
  body: z.object({
    amount: z.number().positive().optional(),
    categoryId: z.string().uuid().optional(),
    newCategory: z.string().min(1).optional(),
    note: z.string().optional(),
    date: z.string().optional(),
  }),
});

// src/validations/record.schema.js

export const getRecordsSchema = z.object({
  params: z.object({
    financeId: z.string().uuid(),
  }),
  query: z.object({
    type: z.enum(["income", "expense"]).optional(),
    filter: z.enum(["day", "week", "month", "year"]).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    sortBy: z.enum(["created_at", "updated_at"]).optional(),
    order: z.enum(["asc", "desc"]).optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(10),
  }),
});

export const deleteRecordSchema = z.object({
  params: z.object({
    recordId: z.string().uuid(),
  }),
});