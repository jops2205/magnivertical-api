import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "@/database";
import { idParamSchema } from "@/schemas/id-param-schema";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";
import { UserRole } from "@/schemas/users/user-schema";

export const deleteProjectController: FastifyPluginAsyncZod = async (app) => {
	app.delete(
		"/:id",
		{
			preHandler: [app.authenticate, app.roles(UserRole.MANAGER), app.verified],
			schema: {
				summary: "Delete Project",
				operationId: "deleteProject",
				tags: ["projects"],
				params: idParamSchema,
				response: {
					204: z.void(),
					404: responseSchema,
				},
			},
		},
		async (request, response) => {
			const { id: projectId } = request.params;

			const project = await db.project.findUnique({ where: { id: projectId } });

			if (!project) {
				return response.code(HttpStatus.NOT_FOUND).send({
					message: "Not found",
					statusCode: HttpStatus.NOT_FOUND,
				});
			}

			await db.project.delete({ where: { id: project.id } });

			return response.code(HttpStatus.NO_CONTENT).send();
		},
	);
};
