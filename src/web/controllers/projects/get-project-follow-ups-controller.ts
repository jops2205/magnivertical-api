import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "@/database";
import { followUpMapper } from "@/database/mappers/follow-up-mapper";
import { followUpSchema } from "@/schemas/follow-ups/follow-up-schema";
import { idParamSchema } from "@/schemas/id-param-schema";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";
import { UserRole } from "@/schemas/users/user-schema";

export const getProjectFollowUpsController = (app: FastifyInstance) => {
	app.withTypeProvider<ZodTypeProvider>().get(
		"/follow-ups/index/:id",
		{
			preHandler: [
				app.authenticate,
				app.roles(UserRole.MANAGER, UserRole.ASSISTANT),
				app.verified,
			],
			schema: {
				summary: "Get Project Follow-Ups",
				operationId: "getProjectFollowUps",
				tags: ["projects"],
				params: idParamSchema,
				response: {
					200: z.array(followUpSchema),
					404: responseSchema,
				},
			},
		},
		async (request, response) => {
			const { id: projectId } = request.params;

			const project = await db.project.findUnique({
				where: { id: projectId },
				select: {
					budgets: {
						select: { followUps: true },
					},
				},
			});

			if (!project) {
				return response.code(HttpStatus.NOT_FOUND).send({
					message: "Not found",
					statusCode: HttpStatus.NOT_FOUND,
				});
			}

			const { budgets } = project;

			if (budgets.length === 0) {
				return response.code(HttpStatus.OK).send([]);
			}

			const followUps = budgets.flatMap(({ followUps }) => followUps);

			return response.code(HttpStatus.OK).send(followUps.map(followUpMapper));
		},
	);
};
