import { z } from "zod";
import { budgetItemSchema } from "./budget-schema";
import { createBudgetSchema } from "./create-budget-schema";

export const updateBudgetSchema = createBudgetSchema
	.extend({
		items: z
			.array(
				budgetItemSchema.extend({
					id: z.uuid().optional(),
				}),
			)
			.min(1),
	})
	.omit({
		projectId: true,
	});

export type UpdateBudgetData = z.infer<typeof updateBudgetSchema>;
