import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "@/database";
import { budgetMapper } from "@/database/mappers/budget-mapper";
import { budgetSchema } from "@/schemas/budgets/budget-schema";
import { idParamSchema } from "@/schemas/id-param-schema";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";
import { UserRole } from "@/schemas/users/user-schema";

export const getProjectBudgetsController: FastifyPluginAsyncZod = async (
	app,
) => {
	app.get(
		"/budgets/index/:id",
		{
			preHandler: [
				app.authenticate,
				app.roles(UserRole.MANAGER, UserRole.ASSISTANT),
				app.verified,
			],
			schema: {
				summary: "Get Project Budgets",
				operationId: "getProjectBudgets",
				tags: ["projects"],
				params: idParamSchema,
				response: {
					200: z.array(budgetSchema),
					404: responseSchema,
				},
			},
		},
		async (request, response) => {
			const { id: projectId } = request.params;

			const project = await db.project.findUnique({
				where: { id: projectId },
				select: {
					budgets: {
						include: { items: true },
					},
				},
			});

			if (!project) {
				return response.code(HttpStatus.NOT_FOUND).send({
					message: "Not found",
					statusCode: HttpStatus.NOT_FOUND,
				});
			}

			const { budgets } = project;

			return response.code(HttpStatus.OK).send(budgets.map(budgetMapper));
		},
	);
};
