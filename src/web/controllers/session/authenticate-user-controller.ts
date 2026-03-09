import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { cache } from "@/cache/redis-cache";
import { db } from "@/database";
import { userMapper } from "@/database/mappers/user-mapper";
import { env } from "@/env";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";
import { tokenParamSchema } from "@/schemas/token-param-schema";
import { encoder } from "@/security/jwt-encoder";
import { CacheKeys } from "@/utils/enums/cache-keys";
import { Cookies } from "@/utils/enums/cookies";
import { days, minutes } from "@/utils/funcs/milliseconds";
import { generator, type IdentifierPayload } from "@/utils/token-generator";

export const authenticateUserController: FastifyPluginAsyncZod = async (
	app,
) => {
	app.get(
		"/authenticate/:token",
		{
			schema: {
				summary: "Authenticate User",
				operationId: "authenticateUser",
				tags: ["session"],
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

			const user = await db.user.findUnique({ where: { id: payload.id } });

			if (!user) {
				return response.code(HttpStatus.NOT_FOUND).send({
					message: "Not found",
					statusCode: HttpStatus.NOT_FOUND,
				});
			}

			const [accessToken, refreshToken] = await Promise.all([
				generator.generateAccessToken(userMapper(user)),
				generator.generateRefreshToken(user.id),
			]);

			await cache.set(`${CacheKeys.REFRESH_TOKEN}:${user.id}`, refreshToken, {
				expiresIn: days(7),
			});

			const isProd = env.get("NODE_ENV") === "prod";

			response.setCookie(Cookies.ACCESS_TOKEN, accessToken, {
				httpOnly: true,
				secure: isProd,
				maxAge: minutes(15),
				path: "/",
				sameSite: "strict",
			});

			response.setCookie(Cookies.REFRESH_TOKEN, refreshToken, {
				httpOnly: true,
				secure: isProd,
				maxAge: days(7),
				path: "/",
				sameSite: "strict",
			});

			return response.code(HttpStatus.FOUND).redirect(env.get("REDIRECT_URL"));
		},
	);
};
