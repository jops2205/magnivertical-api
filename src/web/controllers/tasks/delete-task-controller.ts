import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "@/database";
import { idParamSchema } from "@/schemas/id-param-schema";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";

export const deleteTaskController: FastifyPluginAsyncZod = async (app) => {
	app.delete(
		"/:id",
		{
			preHandler: [app.authenticate, app.verified],
			schema: {
				summary: "Delete Task",
				operationId: "deleteTask",
				tags: ["tasks"],
				params: idParamSchema,
				response: {
					204: z.void(),
					404: responseSchema,
				},
			},
		},
		async (request, response) => {
			const { id: userId } = request.user;
			const { id: taskId } = request.params;

			const task = await db.task.findUnique({
				where: { id: taskId, creatorId: userId },
			});

			if (!task) {
				return response.code(HttpStatus.NOT_FOUND).send({
					message: "Not found",
					statusCode: HttpStatus.NOT_FOUND,
				});
			}

			await db.task.delete({ where: { id: task.id } });

			return response.code(HttpStatus.NO_CONTENT).send();
		},
	);
};
