import { z } from "zod";
import { BudgetItemType } from "../budgets/budget-schema";

const budgetItemTypeRevenueSchema = z.object({
	revenue: z.int(),
});

export const getBudgetItemTypeRevenueSchema = z.object({
	items: z.record(z.enum(BudgetItemType), budgetItemTypeRevenueSchema),
});

export type BudgetItemTypeRevenue = z.infer<typeof budgetItemTypeRevenueSchema>;
