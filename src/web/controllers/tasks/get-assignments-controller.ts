import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "@/database";
import type { Prisma } from "@/database/generated/client";
import { taskMapper } from "@/database/mappers/task-mapper";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";
import { getAssignmentsSchema } from "@/schemas/tasks/get-assignments-schema";
import { taskSchema } from "@/schemas/tasks/task-schema";
import { UserRole } from "@/schemas/users/user-schema";

export const getAssignmentsController: FastifyPluginAsyncZod = async (app) => {
	app.get(
		"/assignments/index",
		{
			preHandler: [app.authenticate, app.roles(UserRole.MANAGER), app.verified],
			schema: {
				summary: "Get Assignments",
				operationId: "getAssignments",
				tags: ["tasks"],
				querystring: getAssignmentsSchema,
				response: {
					200: z.object({
						assignments: z.array(taskSchema),
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
				executor: executorId,
			} = request.query;

			const assignmentWhere: Prisma.TaskWhereInput = {
				creatorId: userId,
				executorId: { not: userId },
				...(status && { status }),
				...(priority && { priority }),
				...(executorId && { executorId }),
				...(search && {
					title: {
						contains: search,
						mode: "insensitive",
					},
				}),
			};

			const [assignmentCount, assignments] = await Promise.all([
				db.task.count({ where: assignmentWhere }),
				db.task.findMany({
					where: assignmentWhere,
					skip: (page - 1) * perPage,
					take: perPage,
					orderBy: {
						...(order && { title: order }),
						...(!order && { createdAt: "desc" }),
					},
				}),
			]);

			return response.code(HttpStatus.OK).send({
				assignments: assignments.map(taskMapper),
				count: assignmentCount,
			});
		},
	);
};
