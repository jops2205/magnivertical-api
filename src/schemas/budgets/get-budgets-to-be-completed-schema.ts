import { z } from "zod";
import { INCOMPLETE_BUDGET_STATUS } from "@/utils/consts/incomplete-budget-status";
import { queryParamsSchema } from "../query-params-schema";

export const getBudgetsToBeCompletedSchema = queryParamsSchema
	.extend({
		status: z.enum(INCOMPLETE_BUDGET_STATUS),
	})
	.partial();

export type GetBudgetsToBeCompletedQuery = z.infer<
	typeof getBudgetsToBeCompletedSchema
>;
