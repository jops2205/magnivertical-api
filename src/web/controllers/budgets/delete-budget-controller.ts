import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "@/database";
import { idParamSchema } from "@/schemas/id-param-schema";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";
import { UserRole } from "@/schemas/users/user-schema";

export const deleteBudgetController: FastifyPluginAsyncZod = async (app) => {
	app.delete(
		"/:id",
		{
			preHandler: [app.authenticate, app.roles(UserRole.MANAGER), app.verified],
			schema: {
				summary: "Delete Budget",
				operationId: "deleteBudget",
				tags: ["budgets"],
				params: idParamSchema,
				response: {
					204: z.void(),
					404: responseSchema,
				},
			},
		},
		async (request, response) => {
			const { id: budgetId } = request.params;

			const budget = await db.budget.findUnique({ where: { id: budgetId } });

			if (!budget) {
				return response.code(HttpStatus.NOT_FOUND).send({
					message: "Not found",
					statusCode: HttpStatus.NOT_FOUND,
				});
			}

			await db.budget.delete({ where: { id: budget.id } });

			return response.code(HttpStatus.NO_CONTENT).send();
		},
	);
};
