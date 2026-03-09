import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "@/database";
import { userMapper } from "@/database/mappers/user-mapper";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";
import {
	UserRole,
	userWithoutPasswordSchema,
} from "@/schemas/users/user-schema";

export const getUsersWithoutQueryController: FastifyPluginAsyncZod = async (
	app,
) => {
	app.get(
		"/index/no-query",
		{
			preHandler: [
				app.authenticate,
				app.roles(UserRole.MANAGER, UserRole.ASSISTANT),
				app.verified,
			],
			schema: {
				summary: "Get Users Without Query",
				operationId: "getUsersWithoutQuery",
				tags: ["users"],
				response: {
					200: z.array(userWithoutPasswordSchema),
					404: responseSchema,
				},
			},
		},
		async (request, response) => {
			const { id: userId } = request.user;

			const users = await db.user.findMany({
				where: {
					id: { not: userId },
				},
			});

			return response.code(HttpStatus.OK).send(users.map(userMapper));
		},
	);
};
