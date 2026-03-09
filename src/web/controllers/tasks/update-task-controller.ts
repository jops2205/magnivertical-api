import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "@/database";
import { idParamSchema } from "@/schemas/id-param-schema";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";
import { updateTaskSchema } from "@/schemas/tasks/update-task-schema";

export const updateTaskController: FastifyPluginAsyncZod = async (app) => {
	app.put(
		"/:id",
		{
			preHandler: [app.authenticate, app.verified],
			schema: {
				summary: "Update Task",
				operationId: "updateTask",
				tags: ["tasks"],
				params: idParamSchema,
				body: updateTaskSchema,
				response: {
					204: z.void(),
					404: responseSchema,
				},
			},
		},
		async (request, response) => {
			const { id: userId } = request.user;
			const { id: taskId } = request.params;
			const { title, description, priority, scheduledAt } = request.body;

			const task = await db.task.findUnique({
				where: {
					id: taskId,
					creatorId: userId,
					executorId: userId,
				},
			});

			if (!task) {
				return response.code(HttpStatus.NOT_FOUND).send({
					message: "Not found",
					statusCode: HttpStatus.NOT_FOUND,
				});
			}

			await db.task.update({
				where: { id: task.id },
				data: {
					title,
					description,
					priority,
					scheduledAt,
				},
			});

			return response.code(HttpStatus.NO_CONTENT).send();
		},
	);
};
