import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "@/database";
import type { Prisma } from "@/database/generated/client";
import { budgetMapper } from "@/database/mappers/budget-mapper";
import type { Budget } from "@/schemas/budgets/budget-schema";
import { CustomerType } from "@/schemas/customers/customer-schema";
import { getCustomerTypeRevenueSchema } from "@/schemas/metrics/customer-type-revenue-schema";
import { getMetricsSchema } from "@/schemas/metrics/get-metrics-schema";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";
import { UserRole } from "@/schemas/users/user-schema";
import { APPROVED_BUDGET_STATUS } from "@/utils/consts/approved-budget-status";
import { calculateNetValue } from "@/utils/funcs/calculate-net-value";

export const getCustomerTypeRevenueController: FastifyPluginAsyncZod = async (
	app,
) => {
	app.get(
		"/customer-type-revenue",
		{
			preHandler: [app.authenticate, app.roles(UserRole.MANAGER), app.verified],
			schema: {
				summary: "Get Customer Type Revenue",
				operationId: "getCustomerTypeRevenue",
				tags: ["metrics"],
				querystring: getMetricsSchema,
				response: {
					200: getCustomerTypeRevenueSchema,
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

			const calculateRevenue = (budgets: Budget[]) => {
				let revenue = 0;

				for (const budget of budgets) {
					const budgetTotalValue = budget.items.reduce(
						(total, item) => total + item.price * item.quantity,
						0,
					);

					const netValue = calculateNetValue(
						budgetTotalValue,
						budget.percentageDiscount,
					);

					revenue += netValue;
				}

				return revenue;
			};

			const businessBudgets = await db.budget.findMany({
				include: { items: true },
				where: {
					...budgetWhere,
					project: {
						customer: { type: CustomerType.BUSINESS },
					},
				},
			});

			const individualBudgets = await db.budget.findMany({
				include: { items: true },
				where: {
					...budgetWhere,
					project: {
						customer: { type: CustomerType.INDIVIDUAL },
					},
				},
			});

			const businessRevenue = calculateRevenue(
				businessBudgets.map(budgetMapper),
			);

			const individualRevenue = calculateRevenue(
				individualBudgets.map(budgetMapper),
			);

			const totalRevenue = businessRevenue + individualRevenue;

			const businessPercentage =
				totalRevenue > 0
					? parseFloat((businessRevenue / totalRevenue).toFixed(2))
					: 0;

			const individualPercentage =
				totalRevenue > 0
					? parseFloat((individualRevenue / totalRevenue).toFixed(2))
					: 0;

			return response.code(HttpStatus.OK).send({
				business: {
					revenue: businessRevenue,
					percentage: businessPercentage,
				},
				individual: {
					revenue: individualRevenue,
					percentage: individualPercentage,
				},
			});
		},
	);
};
