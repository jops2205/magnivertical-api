import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "@/database";
import type { Prisma } from "@/database/generated/client";
import { BudgetStatus } from "@/schemas/budgets/budget-schema";
import { getMetricsSchema } from "@/schemas/metrics/get-metrics-schema";
import {
	getValueDistributionSchema,
	type RangeWithMetrics,
} from "@/schemas/metrics/value-distribution-schema";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";
import { UserRole } from "@/schemas/users/user-schema";
import { APPROVED_BUDGET_STATUS } from "@/utils/consts/approved-budget-status";
import { RANGES } from "@/utils/consts/ranges";
import { calculateNetValue } from "@/utils/funcs/calculate-net-value";

export const getValueDistributionController: FastifyPluginAsyncZod = async (
	app,
) => {
	app.get(
		"/value-distribution",
		{
			preHandler: [app.authenticate, app.roles(UserRole.MANAGER), app.verified],
			schema: {
				summary: "Get Value Distribution",
				operationId: "getValueDistribution",
				tags: ["metrics"],
				querystring: getMetricsSchema,
				response: {
					200: getValueDistributionSchema,
					404: responseSchema,
				},
			},
		},
		async (request, response) => {
			const { from, to } = request.query;

			const projectWhere: Prisma.ProjectWhereInput = {
				...{
					startedAt: {
						...(from && { gte: from }),
						...(to && { lte: to }),
					},
				},
			};

			const projects = await db.project.findMany({ where: projectWhere });

			const ranges: RangeWithMetrics[] = RANGES.map(({ min, max }) => ({
				min,
				max,
				projectCount: 0,
				budgetSent: 0,
				budgetApproved: 0,
				approvalPercentage: 0,
			}));

			const budgetWhere: Prisma.BudgetWhereInput = {
				...{
					createdAt: {
						...(from && { gte: from }),
						...(to && { lte: to }),
					},
				},
			};

			for (const project of projects) {
				const budgets = await db.budget.findMany({
					include: { items: true },
					where: {
						...budgetWhere,
						projectId: project.id,
					},
				});

				const budgetsTotalValue = budgets.reduce((total, budget) => {
					const budgetTotalValue = budget.items.reduce(
						(total, item) => total + item.price * item.quantity,
						0,
					);

					const netValue = calculateNetValue(
						budgetTotalValue,
						budget.percentageDiscount,
					);

					return total + netValue;
				}, 0);

				for (const range of ranges) {
					if (
						budgetsTotalValue >= range.min &&
						(!range.max || budgetsTotalValue <= range.max)
					) {
						const budgetSent = budgets.filter(
							(budget) => budget.status !== BudgetStatus.DRAFT,
						);

						const budgetApproved = budgets.filter((budget) => {
							return APPROVED_BUDGET_STATUS.includes(
								BudgetStatus[budget.status],
							);
						});

						range.projectCount += 1;
						range.budgetSent += budgetSent.length;
						range.budgetApproved += budgetApproved.length;

						break;
					}
				}

				for (const range of ranges) {
					range.approvalPercentage = range.budgetSent
						? parseFloat((range.budgetApproved / range.budgetSent).toFixed(2))
						: 0;
				}
			}

			return response.code(HttpStatus.OK).send({ ranges });
		},
	);
};
