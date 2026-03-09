import { BudgetStatus } from "@/schemas/budgets/budget-schema";

export const APPROVED_BUDGET_STATUS: BudgetStatus[] = [
	BudgetStatus.REQUESTED,
	BudgetStatus.IN_PRODUCTION,
	BudgetStatus.PENDING_COMPLETION,
	BudgetStatus.COMPLETED,
];
