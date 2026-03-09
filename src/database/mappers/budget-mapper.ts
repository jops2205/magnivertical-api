import type { Prisma } from "@/database/generated/client";
import {
	type Budget,
	BudgetItemType,
	BudgetStatus,
} from "@/schemas/budgets/budget-schema";

type RawBudget = Prisma.BudgetGetPayload<{
	include: {
		items: true;
	};
}>;

export const budgetMapper = (budget: RawBudget): Budget => {
	const { items } = budget;

	return {
		id: budget.id,
		name: budget.name,
		status: BudgetStatus[budget.status],
		percentageDiscount: budget.percentageDiscount,
		attachmentsUrl: budget.attachmentsUrl,
		createdAt: budget.createdAt,
		userId: budget.userId,
		projectId: budget.projectId,
		items: items.map((item) => ({
			id: item.id,
			name: item.name,
			price: item.price,
			quantity: item.quantity,
			type: BudgetItemType[item.type],
		})),
	};
};
