import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "@/database";
import type { Prisma } from "@/database/generated/client";
import { projectMapper } from "@/database/mappers/project-mapper";
import { getProjectsSchema } from "@/schemas/projects/get-projects-schema";
import { projectSchema } from "@/schemas/projects/project-schema";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";
import { UserRole } from "@/schemas/users/user-schema";

export const getProjectsController: FastifyPluginAsyncZod = async (app) => {
	app.get(
		"/index",
		{
			preHandler: [
				app.authenticate,
				app.roles(UserRole.MANAGER, UserRole.ASSISTANT),
				app.verified,
			],
			schema: {
				summary: "Get Projects",
				operationId: "getProjects",
				tags: ["projects"],
				querystring: getProjectsSchema,
				response: {
					200: z.object({
						projects: z.array(projectSchema),
						count: z.int(),
					}),
					404: responseSchema,
				},
			},
		},
		async (request, response) => {
			const {
				page = 1,
				perPage = 10,
				order,
				search,
				from,
				to,
				status,
				customer: customerId,
			} = request.query;

			const projectWhere: Prisma.ProjectWhereInput = {
				...(status && { status }),
				...(customerId && { customerId }),
				...{
					startedAt: {
						...(from && { gte: from }),
						...(to && { lte: to }),
					},
				},
				...(search && {
					name: {
						contains: search,
						mode: "insensitive",
					},
				}),
			};

			const [projectCount, projects] = await Promise.all([
				db.project.count({ where: projectWhere }),
				db.project.findMany({
					where: projectWhere,
					include: { address: true },
					skip: (page - 1) * perPage,
					take: perPage,
					orderBy: {
						...(order && { name: order }),
						...(!order && { startedAt: "desc" }),
					},
				}),
			]);

			return response.code(HttpStatus.OK).send({
				projects: projects.map(projectMapper),
				count: projectCount,
			});
		},
	);
};
