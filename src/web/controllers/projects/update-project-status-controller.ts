import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "@/database";
import { idParamSchema } from "@/schemas/id-param-schema";
import { ProjectStatus } from "@/schemas/projects/project-schema";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";
import { UserRole } from "@/schemas/users/user-schema";
import { StateMachine } from "@/utils/state-machine";

export const updateProjectStatusController: FastifyPluginAsyncZod = async (
	app,
) => {
	app.patch(
		"/status/:id",
		{
			preHandler: [
				app.authenticate,
				app.roles(UserRole.MANAGER, UserRole.ASSISTANT),
				app.verified,
			],
			schema: {
				summary: "Update Project Status",
				operationId: "updateProjectStatus",
				tags: ["projects"],
				params: idParamSchema,
				body: z.object({ status: z.enum(ProjectStatus) }),
				response: {
					204: z.void(),
					404: responseSchema,
					409: responseSchema,
				},
			},
		},
		async (request, response) => {
			const { id: projectId } = request.params;
			const { status } = request.body;

			const project = await db.project.findUnique({ where: { id: projectId } });

			if (!project) {
				return response.code(HttpStatus.NOT_FOUND).send({
					message: "Not found",
					statusCode: HttpStatus.NOT_FOUND,
				});
			}

			const state = new StateMachine<ProjectStatus>({
				PLANNED: [ProjectStatus.IN_PROGRESS],
				IN_PROGRESS: [ProjectStatus.COMPLETED, ProjectStatus.CANCELED],
				COMPLETED: [],
				CANCELED: [],
			});

			const isValid = state.isTransitionValid(
				ProjectStatus[project.status],
				status,
			);

			if (!isValid) {
				return response.code(HttpStatus.CONFLICT).send({
					message: "Conflict",
					statusCode: HttpStatus.CONFLICT,
				});
			}

			let isEnded = false;

			if (
				status === ProjectStatus.COMPLETED ||
				status === ProjectStatus.CANCELED
			) {
				isEnded = true;
			}

			await db.project.update({
				where: { id: project.id },
				data: {
					status,
					...(isEnded && { endedAt: new Date() }),
				},
			});

			return response.code(HttpStatus.NO_CONTENT).send();
		},
	);
};
