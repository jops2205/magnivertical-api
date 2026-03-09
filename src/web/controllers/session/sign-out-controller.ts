import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { cache } from "@/cache/redis-cache";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";
import { CacheKeys } from "@/utils/enums/cache-keys";
import { Cookies } from "@/utils/enums/cookies";

export const signOutController: FastifyPluginAsyncZod = async (app) => {
	app.post(
		"/out",
		{
			preHandler: [app.authenticate],
			schema: {
				summary: "Sign Out",
				operationId: "signOut",
				tags: ["session"],
				response: {
					200: z.void(),
					404: responseSchema,
				},
			},
		},
		async (request, response) => {
			const { id: userId } = request.user;

			await cache.delete(`${CacheKeys.REFRESH_TOKEN}:${userId}`);

			response.clearCookie(Cookies.ACCESS_TOKEN);
			response.clearCookie(Cookies.REFRESH_TOKEN);

			return response.code(HttpStatus.OK).send();
		},
	);
};
