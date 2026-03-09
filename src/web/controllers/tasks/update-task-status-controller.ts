import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "@/database";
import { idParamSchema } from "@/schemas/id-param-schema";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";
import { TaskStatus } from "@/schemas/tasks/task-schema";
import { StateMachine } from "@/utils/state-machine";

export const updateTaskStatusController: FastifyPluginAsyncZod = async (
	app,
) => {
	app.patch(
		"/status/:id",
		{
			preHandler: [app.authenticate, app.verified],
			schema: {
				summary: "Update Task Status",
				operationId: "updateTaskStatus",
				tags: ["tasks"],
				params: idParamSchema,
				body: z.object({ status: z.enum(TaskStatus) }),
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
			const { status } = request.body;

			const task = await db.task.findUnique({
				where: {
					id: taskId,
					executorId: userId,
				},
			});

			if (!task) {
				return response.code(HttpStatus.NOT_FOUND).send({
					message: "Not found",
					statusCode: HttpStatus.NOT_FOUND,
				});
			}

			const state = new StateMachine<TaskStatus>({
				PENDING: [TaskStatus.IN_PROGRESS],
				IN_PROGRESS: [TaskStatus.DONE, TaskStatus.CANCELED],
				DONE: [],
				CANCELED: [],
			});

			const isValid = state.isTransitionValid(TaskStatus[task.status], status);

			if (!isValid) {
				return response.code(HttpStatus.CONFLICT).send({
					message: "Conflict",
					statusCode: HttpStatus.CONFLICT,
				});
			}

			let isStarted = false;
			let isCompleted = false;

			if (status === TaskStatus.IN_PROGRESS) {
				isStarted = true;
			}

			if (status === TaskStatus.DONE || status === TaskStatus.CANCELED) {
				isCompleted = true;
			}

			await db.task.update({
				where: { id: task.id },
				data: {
					status,
					...(isStarted && { startedAt: new Date() }),
					...(isCompleted && { completedAt: new Date() }),
				},
			});

			return response.code(HttpStatus.NO_CONTENT).send();
		},
	);
};
