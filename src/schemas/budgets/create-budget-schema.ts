import { z } from "zod";
import { budgetItemSchema } from "./budget-schema";

export const createBudgetSchema = z.object({
	name: z.string().min(1),
	percentageDiscount: z.int(),
	attachmentsUrl: z.url(),
	projectId: z.uuid(),
	items: z.array(budgetItemSchema.omit({ id: true })).min(1),
});

export type CreateBudgetData = z.infer<typeof createBudgetSchema>;
