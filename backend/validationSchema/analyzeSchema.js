
import { z } from "zod";

export const financeIdParam = z.object({
  params: z.object({
    financeId: z.string().uuid(),
  }),
});

export const summaryQuerySchema = z.object({
  query: z.object({
    filter: z.enum(["day", "week", "month", "year"]).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});

export const typeQuerySchema = z.object({
  query: z.object({
    type: z.enum(["income", "expense"]),
    filter: z.enum(["day", "week", "month", "year"]).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});
