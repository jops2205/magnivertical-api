import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "@/database";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";
import { createTaskSchema } from "@/schemas/tasks/create-task-schema";

export const createTaskController: FastifyPluginAsyncZod = async (app) => {
	app.post(
		"/",
		{
			preHandler: [app.authenticate, app.verified],
			schema: {
				summary: "Create Task",
				operationId: "createTask",
				tags: ["tasks"],
				body: createTaskSchema,
				response: {
					201: z.void(),
					404: responseSchema,
				},
			},
		},
		async (request, response) => {
			const { id: userId } = request.user;
			const { title, description, priority, scheduledAt } = request.body;

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
						connect: { id: userId },
					},
				},
			});

			return response.code(HttpStatus.CREATED).send();
		},
	);
};
