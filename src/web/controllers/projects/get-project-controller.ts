import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "@/database";
import { projectMapper } from "@/database/mappers/project-mapper";
import { idParamSchema } from "@/schemas/id-param-schema";
import { projectSchema } from "@/schemas/projects/project-schema";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";
import { UserRole } from "@/schemas/users/user-schema";

export const getProjectController: FastifyPluginAsyncZod = async (app) => {
	app.get(
		"/:id",
		{
			preHandler: [
				app.authenticate,
				app.roles(UserRole.MANAGER, UserRole.ASSISTANT),
				app.verified,
			],
			schema: {
				summary: "Get Project",
				operationId: "getProject",
				tags: ["projects"],
				params: idParamSchema,
				response: {
					200: projectSchema,
					404: responseSchema,
				},
			},
		},
		async (request, response) => {
			const { id: projectId } = request.params;

			const project = await db.project.findUnique({
				where: { id: projectId },
				include: { address: true },
			});

			if (!project) {
				return response.code(HttpStatus.NOT_FOUND).send({
					message: "Not found",
					statusCode: HttpStatus.NOT_FOUND,
				});
			}

			return response.code(HttpStatus.OK).send(projectMapper(project));
		},
	);
};
