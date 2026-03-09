import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { cache } from "@/cache/redis-cache";
import { db } from "@/database";
import { env } from "@/env";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";
import { tokenParamSchema } from "@/schemas/token-param-schema";
import { encoder } from "@/security/jwt-encoder";
import { CacheKeys } from "@/utils/enums/cache-keys";
import type { IdentifierPayload } from "@/utils/token-generator";

export const verifyUserController: FastifyPluginAsyncZod = async (app) => {
	app.get(
		"/verify/:token",
		{
			schema: {
				summary: "Verify User",
				operationId: "verifyUser",
				tags: ["users"],
				params: tokenParamSchema,
				response: {
					302: z.void(),
					401: responseSchema,
					404: responseSchema,
				},
			},
		},
		async (request, response) => {
			const { token } = request.params;

			const payload = await encoder.decode<IdentifierPayload>(token);

			if (!payload) {
				return response.code(HttpStatus.UNAUTHORIZED).send({
					message: "Unauthorized",
					statusCode: HttpStatus.UNAUTHORIZED,
				});
			}

			const user = await db.user.findUnique({
				where: {
					id: payload.id,
					verified: false,
				},
			});

			if (!user) {
				return response.code(HttpStatus.NOT_FOUND).send({
					message: "Not found",
					statusCode: HttpStatus.NOT_FOUND,
				});
			}

			await db.user.update({
				where: { id: user.id },
				data: { verified: true },
			});

			await cache.delete(`${CacheKeys.CURRENT_USER}:${user.id}`);

			return response
				.status(HttpStatus.FOUND)
				.redirect(env.get("REDIRECT_URL"));
		},
	);
};
