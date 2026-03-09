import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "@/database";
import { updateBudgetSchema } from "@/schemas/budgets/update-budget-schema";
import { idParamSchema } from "@/schemas/id-param-schema";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";
import { UserRole } from "@/schemas/users/user-schema";

export const updateBudgetController: FastifyPluginAsyncZod = async (app) => {
	app.put(
		"/:id",
		{
			preHandler: [
				app.authenticate,
				app.roles(UserRole.MANAGER, UserRole.ASSISTANT),
				app.verified,
			],
			schema: {
				summary: "Update Budget",
				operationId: "updateBudget",
				tags: ["budgets"],
				params: idParamSchema,
				body: updateBudgetSchema,
				response: {
					204: z.void(),
					404: responseSchema,
					409: responseSchema,
				},
			},
		},
		async (request, response) => {
			const { id: budgetId } = request.params;
			const { name, percentageDiscount, attachmentsUrl, items } = request.body;

			const budget = await db.budget.findUnique({
				where: { id: budgetId },
				include: { items: true },
			});

			if (!budget) {
				return response.code(HttpStatus.NOT_FOUND).send({
					message: "Not found",
					statusCode: HttpStatus.NOT_FOUND,
				});
			}

			const itemsToUpdate = items.filter((item) => item.id);
			const itemsToCreate = items.filter((item) => !item.id);

			const currentItemIds = budget.items.map((item) => item.id);
			const itemIdsToUpdate = itemsToUpdate.map((item) => item.id);

			const itemIdsToDelete = currentItemIds.filter(
				(id) => !itemIdsToUpdate.includes(id),
			);

			await db.budget.update({
				where: { id: budget.id },
				data: {
					name,
					percentageDiscount,
					attachmentsUrl,
					items: {
						deleteMany: {
							id: { in: itemIdsToDelete },
						},
						create: itemsToCreate,
						update: itemsToUpdate.map((item) => {
							const { id, ...data } = item;

							return { where: { id }, data };
						}),
					},
				},
			});

			return response.code(HttpStatus.NO_CONTENT).send();
		},
	);
};
