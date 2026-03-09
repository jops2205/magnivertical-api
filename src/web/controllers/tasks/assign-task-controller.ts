import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "@/database";
import { idParamSchema } from "@/schemas/id-param-schema";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";
import { createTaskSchema } from "@/schemas/tasks/create-task-schema";
import { UserRole } from "@/schemas/users/user-schema";

export const assignTaskController: FastifyPluginAsyncZod = async (app) => {
	app.post(
		"/assignments/:id",
		{
			preHandler: [app.authenticate, app.roles(UserRole.MANAGER), app.verified],
			schema: {
				summary: "Assign Task",
				operationId: "assignTask",
				tags: ["tasks"],
				params: idParamSchema,
				body: createTaskSchema,
				response: {
					201: z.void(),
					404: responseSchema,
				},
			},
		},
		async (request, response) => {
			const { id: userId } = request.user;
			const { id: userToAssignId } = request.params;
			const { title, description, priority, scheduledAt } = request.body;

			const user = await db.user.findUnique({ where: { id: userToAssignId } });

			if (!user) {
				return response.code(HttpStatus.NOT_FOUND).send({
					message: "Not found",
					statusCode: HttpStatus.NOT_FOUND,
				});
			}

			await db.task.create({
				data: {
					title,
					description,
					priority,
					scheduledAt,
					creator: {
						connect: { id: userId },
					},
					executor: {
						connect: { id: user.id },
					},
				},
			});

			return response.code(HttpStatus.CREATED).send();
		},
	);
};
