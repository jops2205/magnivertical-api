import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "@/database";
import type { Prisma } from "@/database/generated/client";
import { District } from "@/schemas/address-schema";
import {
	type DistrictRevenue,
	getDistrictRevenueSchema,
} from "@/schemas/metrics/district-revenue-schema";
import { getMetricsSchema } from "@/schemas/metrics/get-metrics-schema";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";
import { UserRole } from "@/schemas/users/user-schema";
import { APPROVED_BUDGET_STATUS } from "@/utils/consts/approved-budget-status";
import { calculateNetValue } from "@/utils/funcs/calculate-net-value";

export const getDistrictRevenueController: FastifyPluginAsyncZod = async (
	app,
) => {
	app.get(
		"/district-revenue",
		{
			preHandler: [app.authenticate, app.roles(UserRole.MANAGER), app.verified],
			schema: {
				summary: "Get District Revenue",
				operationId: "getDistrictRevenue",
				tags: ["metrics"],
				querystring: getMetricsSchema,
				response: {
					200: getDistrictRevenueSchema,
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
				include: {
					items: true,
					project: {
						include: { address: true },
					},
				},
			});

			const districts: Record<string, DistrictRevenue> = {};

			for (const district of Object.values(District)) {
				districts[district] = {
					revenue: 0,
				};
			}

			for (const budget of budgets) {
				const district = budget.project.address.district;

				const budgetTotalValue = budget.items.reduce(
					(total, item) => total + item.price * item.quantity,
					0,
				);

				const netValue = calculateNetValue(
					budgetTotalValue,
					budget.percentageDiscount,
				);

				districts[district].revenue += netValue;
			}

			return response.code(HttpStatus.OK).send({ districts });
		},
	);
};
