import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "@/database";
import { idParamSchema } from "@/schemas/id-param-schema";
import { updateProjectSchema } from "@/schemas/projects/update-project-schema";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";
import { UserRole } from "@/schemas/users/user-schema";

export const updateProjectController: FastifyPluginAsyncZod = async (app) => {
	app.put(
		"/:id",
		{
			preHandler: [
				app.authenticate,
				app.roles(UserRole.MANAGER, UserRole.ASSISTANT),
				app.verified,
			],
			schema: {
				summary: "Update Project",
				operationId: "updateProject",
				tags: ["projects"],
				params: idParamSchema,
				body: updateProjectSchema,
				response: {
					204: z.void(),
					404: responseSchema,
					409: responseSchema,
				},
			},
		},
		async (request, response) => {
			const { id: projectId } = request.params;
			const { name, address } = request.body;

			const project = await db.project.findUnique({ where: { id: projectId } });

			if (!project) {
				return response.code(HttpStatus.NOT_FOUND).send({
					message: "Not found",
					statusCode: HttpStatus.NOT_FOUND,
				});
			}

			await db.project.update({
				where: { id: project.id },
				data: {
					name,
					address: {
						update: address,
					},
				},
			});

			return response.code(HttpStatus.NO_CONTENT).send();
		},
	);
};
