import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { cache } from "@/cache/redis-cache";
import { db } from "@/database";
import { userMapper } from "@/database/mappers/user-mapper";
import { env } from "@/env";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";
import { encoder } from "@/security/jwt-encoder";
import { CacheKeys } from "@/utils/enums/cache-keys";
import { Cookies } from "@/utils/enums/cookies";
import { days, minutes } from "@/utils/funcs/milliseconds";
import { generator, type IdentifierPayload } from "@/utils/token-generator";

export const refreshSessionController: FastifyPluginAsyncZod = async (app) => {
	app.get(
		"/refresh",
		{
			preHandler: [app.refresh],
			schema: {
				summary: "Refresh Session",
				operationId: "refreshSession",
				tags: ["session"],
				response: {
					200: z.void(),
					401: responseSchema,
					404: responseSchema,
				},
			},
		},
		async (request, response) => {
			const refreshToken = request.cookies[Cookies.REFRESH_TOKEN];

			if (!refreshToken) {
				return response.code(HttpStatus.UNAUTHORIZED).send({
					message: "Unauthorized",
					statusCode: HttpStatus.UNAUTHORIZED,
				});
			}

			const payload = await encoder.decode<IdentifierPayload>(refreshToken);

			if (!payload) {
				return response.code(HttpStatus.UNAUTHORIZED).send({
					message: "Unauthorized",
					statusCode: HttpStatus.UNAUTHORIZED,
				});
			}

			const user = await db.user.findUnique({ where: { id: payload.id } });

			if (!user) {
				return response.code(HttpStatus.NOT_FOUND).send({
					message: "Not found",
					statusCode: HttpStatus.NOT_FOUND,
				});
			}

			const cachedRefreshToken = await cache.get(
				`${CacheKeys.REFRESH_TOKEN}:${user.id}`,
			);

			if (refreshToken !== cachedRefreshToken) {
				return response.code(HttpStatus.UNAUTHORIZED).send({
					message: "Unauthorized",
					statusCode: HttpStatus.UNAUTHORIZED,
				});
			}

			const [newAccessToken, newRefreshToken] = await Promise.all([
				generator.generateAccessToken(userMapper(user)),
				generator.generateRefreshToken(user.id),
			]);

			await cache.set(
				`${CacheKeys.REFRESH_TOKEN}:${user.id}`,
				newRefreshToken,
				{
					expiresIn: days(7),
				},
			);

			const isProd = env.get("NODE_ENV") === "prod";

			response.setCookie(Cookies.ACCESS_TOKEN, newAccessToken, {
				httpOnly: true,
				secure: isProd,
				maxAge: minutes(15),
				path: "/",
				sameSite: "strict",
			});

			response.setCookie(Cookies.REFRESH_TOKEN, newRefreshToken, {
				httpOnly: true,
				secure: isProd,
				maxAge: days(7),
				path: "/",
				sameSite: "strict",
			});

			return response.code(HttpStatus.OK).send();
		},
	);
};
