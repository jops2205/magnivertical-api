import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { cache } from "@/cache/redis-cache";
import { db } from "@/database";
import { userMapper } from "@/database/mappers/user-mapper";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";
import {
	type UserWithoutPassword,
	userWithoutPasswordSchema,
} from "@/schemas/users/user-schema";
import { CacheKeys } from "@/utils/enums/cache-keys";
import { minutes } from "@/utils/funcs/milliseconds";

export const getUserController: FastifyPluginAsyncZod = async (app) => {
	app.get(
		"/",
		{
			preHandler: [app.authenticate],
			schema: {
				summary: "Get User",
				operationId: "getUser",
				tags: ["users"],
				response: {
					200: userWithoutPasswordSchema,
					404: responseSchema,
				},
			},
		},
		async (request, response) => {
			const { id: userId } = request.user;

			const cacheKey = `${CacheKeys.CURRENT_USER}:${userId}`;

			const cachedUser = await cache.get<UserWithoutPassword>(cacheKey, {
				json: true,
			});

			if (cachedUser) {
				return response.code(HttpStatus.OK).send(cachedUser);
			}

			const user = await db.user.findUnique({ where: { id: userId } });

			if (!user) {
				return response.code(HttpStatus.NOT_FOUND).send({
					message: "Not found",
					statusCode: HttpStatus.NOT_FOUND,
				});
			}

			await cache.set<UserWithoutPassword>(cacheKey, userMapper(user), {
				json: true,
				expiresIn: minutes(10),
			});

			return response.code(HttpStatus.OK).send(userMapper(user));
		},
	);
};
