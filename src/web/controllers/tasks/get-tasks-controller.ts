import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "@/database";
import type { Prisma } from "@/database/generated/client";
import { taskMapper } from "@/database/mappers/task-mapper";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";
import { getTasksSchema } from "@/schemas/tasks/get-tasks-schema";
import { taskSchema } from "@/schemas/tasks/task-schema";

export const getTasksController: FastifyPluginAsyncZod = async (app) => {
	app.get(
		"/index",
		{
			preHandler: [app.authenticate, app.verified],
			schema: {
				summary: "Get Tasks",
				operationId: "getTasks",
				tags: ["tasks"],
				querystring: getTasksSchema,
				response: {
					200: z.object({
						tasks: z.array(taskSchema),
						count: z.int(),
					}),
					404: responseSchema,
				},
			},
		},
		async (request, response) => {
			const { id: userId } = request.user;

			const {
				page = 1,
				perPage = 10,
				order,
				search,
				status,
				priority,
			} = request.query;

			const taskWhere: Prisma.TaskWhereInput = {
				executorId: userId,
				...(status && { status }),
				...(priority && { priority }),
				...(search && {
					title: {
						contains: search,
						mode: "insensitive",
					},
				}),
			};

			const [taskCount, tasks] = await Promise.all([
				db.task.count({ where: taskWhere }),
				db.task.findMany({
					where: taskWhere,
					skip: (page - 1) * perPage,
					take: perPage,
					orderBy: {
						...(order && { title: order }),
						...(!order && { createdAt: "desc" }),
					},
				}),
			]);

			return response
				.code(HttpStatus.OK)
				.send({ tasks: tasks.map(taskMapper), count: taskCount });
		},
	);
};
