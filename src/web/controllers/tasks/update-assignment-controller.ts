import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "@/database";
import { idParamSchema } from "@/schemas/id-param-schema";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";
import { updateAssignmentSchema } from "@/schemas/tasks/update-assignment-schema";
import { UserRole } from "@/schemas/users/user-schema";

export const updateAssignmentController: FastifyPluginAsyncZod = async (
	app,
) => {
	app.put(
		"/assignments/:id",
		{
			preHandler: [app.authenticate, app.roles(UserRole.MANAGER), app.verified],
			schema: {
				summary: "Update Assignments",
				operationId: "updateAssignment",
				tags: ["tasks"],
				params: idParamSchema,
				body: updateAssignmentSchema,
				response: {
					204: z.void(),
					404: responseSchema,
					409: responseSchema,
				},
			},
		},
		async (request, response) => {
			const { id: userId } = request.user;
			const { id: taskId } = request.params;
			const { title, description, priority, scheduledAt } = request.body;
			const { executorId } = request.body;

			const user = await db.user.findUnique({ where: { id: executorId } });

			if (!user) {
				return response.code(HttpStatus.NOT_FOUND).send({
					message: "Not found",
					statusCode: HttpStatus.NOT_FOUND,
				});
			}

			if (userId === user.id) {
				return response.code(HttpStatus.CONFLICT).send();
			}

			const task = await db.task.findUnique({
				where: {
					id: taskId,
					creatorId: userId,
					executorId: { not: userId },
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
					executor: {
						connect: { id: user.id },
					},
				},
			});

			return response.code(HttpStatus.NO_CONTENT).send();
		},
	);
};
