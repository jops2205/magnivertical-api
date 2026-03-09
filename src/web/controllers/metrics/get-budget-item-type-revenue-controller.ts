import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "@/database";
import type { Prisma } from "@/database/generated/client";
import { BudgetItemType } from "@/schemas/budgets/budget-schema";
import {
	type BudgetItemTypeRevenue,
	getBudgetItemTypeRevenueSchema,
} from "@/schemas/metrics/budget-item-type-revenue-schema";
import { getMetricsSchema } from "@/schemas/metrics/get-metrics-schema";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";
import { UserRole } from "@/schemas/users/user-schema";
import { APPROVED_BUDGET_STATUS } from "@/utils/consts/approved-budget-status";
import { calculateNetValue } from "@/utils/funcs/calculate-net-value";

export const getBudgetItemTypeRevenueController: FastifyPluginAsyncZod = async (
	app,
) => {
	app.get(
		"/budget-item-revenue",
		{
			preHandler: [app.authenticate, app.roles(UserRole.MANAGER), app.verified],
			schema: {
				summary: "Get Budget Item Type Revenue",
				operationId: "getBudgetItemTypeRevenue",
				tags: ["metrics"],
				querystring: getMetricsSchema,
				response: {
					200: getBudgetItemTypeRevenueSchema,
					404: responseSchema,
				},
			},
		},
		async (request, response) => {
			const { from, to } = request.query;

			const budgetWhere: Prisma.BudgetWhereInput = {
				...{
					status: { in: APPROVED_BUDGET_STATUS },
					createdAt: {
						...(from && { gte: from }),
						...(to && { lte: to }),
					},
				},
			};

			const budgets = await db.budget.findMany({
				where: budgetWhere,
				include: { items: true },
			});

			const items: Record<string, BudgetItemTypeRevenue> = {};

			for (const type of Object.values(BudgetItemType)) {
				items[type] = {
					revenue: 0,
				};
			}

			for (const budget of budgets) {
				for (const item of budget.items) {
					const itemTotalValue = item.price * item.quantity;

					const netValue = calculateNetValue(
						itemTotalValue,
						budget.percentageDiscount,
					);

					items[item.type].revenue += netValue;
				}
			}

			return response.code(HttpStatus.OK).send({ items });
		},
	);
};
