import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "@/database";
import type { Prisma } from "@/database/generated/client";
import { budgetMapper } from "@/database/mappers/budget-mapper";
import { budgetSchema } from "@/schemas/budgets/budget-schema";
import { getBudgetsToBeCompletedSchema } from "@/schemas/budgets/get-budgets-to-be-completed-schema";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";
import { UserRole } from "@/schemas/users/user-schema";
import { INCOMPLETE_BUDGET_STATUS } from "@/utils/consts/incomplete-budget-status";

export const getBudgetsToBeCompletedController: FastifyPluginAsyncZod = async (
	app,
) => {
	app.get(
		"/incomplete/index",
		{
			preHandler: [
				app.authenticate,
				app.roles(UserRole.OPERATOR),
				app.verified,
			],
			schema: {
				summary: "Get Budgets To Be Completed",
				operationId: "getBudgetsToBeCompleted",
				tags: ["budgets"],
				querystring: getBudgetsToBeCompletedSchema,
				response: {
					200: z.object({
						budgets: z.array(budgetSchema),
						count: z.int(),
					}),
					404: responseSchema,
				},
			},
		},
		async (request, response) => {
			const { page = 1, perPage = 10, order, search, status } = request.query;

			const budgetWhere: Prisma.BudgetWhereInput = {
				...(status && { status }),
				...(!status && {
					status: {
						in: INCOMPLETE_BUDGET_STATUS,
					},
				}),
				...(search && {
					name: {
						contains: search,
						mode: "insensitive",
					},
				}),
			};

			const [budgetCount, budgets] = await Promise.all([
				db.budget.count({ where: budgetWhere }),
				db.budget.findMany({
					where: budgetWhere,
					include: { items: true },
					skip: (page - 1) * perPage,
					take: perPage,
					orderBy: {
						...(order && { name: order }),
						...(!order && { createdAt: "desc" }),
					},
				}),
			]);

			return response.code(HttpStatus.OK).send({
				budgets: budgets.map(budgetMapper),
				count: budgetCount,
			});
		},
	);
};
