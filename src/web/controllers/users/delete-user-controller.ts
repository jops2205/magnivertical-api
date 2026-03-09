import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { cache } from "@/cache/redis-cache";
import { db } from "@/database";
import { idParamSchema } from "@/schemas/id-param-schema";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";
import { UserRole } from "@/schemas/users/user-schema";
import { CacheKeys } from "@/utils/enums/cache-keys";

export const deleteUserController: FastifyPluginAsyncZod = async (app) => {
	app.delete(
		"/:id",
		{
			preHandler: [app.authenticate, app.roles(UserRole.MANAGER), app.verified],
			schema: {
				summary: "Delete User",
				operationId: "deleteUser",
				tags: ["users"],
				params: idParamSchema,
				response: {
					204: z.void(),
					404: responseSchema,
				},
			},
		},
		async (request, response) => {
			const { id: userToDeleteId } = request.params;

			const user = await db.user.findUnique({ where: { id: userToDeleteId } });

			if (!user) {
				return response.code(HttpStatus.NOT_FOUND).send({
					message: "Not found",
					statusCode: HttpStatus.NOT_FOUND,
				});
			}

			await db.user.delete({ where: { id: user.id } });
			await cache.delete(`${CacheKeys.CURRENT_USER}:${user.id}`);

			return response.code(HttpStatus.NO_CONTENT).send();
		},
	);
};
