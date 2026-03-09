import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "@/database";
import { createBudgetSchema } from "@/schemas/budgets/create-budget-schema";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";
import { UserRole } from "@/schemas/users/user-schema";

export const createBudgetController: FastifyPluginAsyncZod = async (app) => {
	app.post(
		"/",
		{
			preHandler: [
				app.authenticate,
				app.roles(UserRole.MANAGER, UserRole.ASSISTANT),
				app.verified,
			],
			schema: {
				summary: "Create Budget",
				operationId: "createBudget",
				tags: ["budgets"],
				body: createBudgetSchema,
				response: {
					201: z.void(),
					404: responseSchema,
				},
			},
		},
		async (request, response) => {
			const { id: userId } = request.user;
			const { name, percentageDiscount, attachmentsUrl } = request.body;
			const { items, projectId } = request.body;

			const project = await db.project.findUnique({ where: { id: projectId } });

			if (!project) {
				return response.code(HttpStatus.NOT_FOUND).send({
					message: "Not found",
					statusCode: HttpStatus.NOT_FOUND,
				});
			}

			const followUpSchedule = new Date();
			followUpSchedule.setDate(followUpSchedule.getDate() + 15);

			await db.budget.create({
				data: {
					name,
					percentageDiscount,
					attachmentsUrl,
					user: {
						connect: { id: userId },
					},
					project: {
						connect: { id: project.id },
					},
					items: {
						create: items,
					},
					followUps: {
						create: {
							scheduledAt: followUpSchedule,
							userId,
						},
					},
				},
			});

			return response.code(HttpStatus.CREATED).send();
		},
	);
};
