import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "@/database";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";
import { encoder } from "@/security/jwt-encoder";
import { Cookies } from "@/utils/enums/cookies";
import type { IdentifierPayload } from "@/utils/token-generator";

export const checkAuthenticationController: FastifyPluginAsyncZod = async (
	app,
) => {
	app.get(
		"/check",
		{
			schema: {
				summary: "Check Authentication",
				operationId: "checkAuthentication",
				tags: ["session"],
				response: {
					200: z.void(),
					404: responseSchema,
					401: responseSchema,
				},
			},
		},
		async (request, response) => {
			const accessToken = request.cookies[Cookies.ACCESS_TOKEN];

			if (!accessToken) {
				return response.code(HttpStatus.UNAUTHORIZED).send({
					message: "Unauthorized",
					statusCode: HttpStatus.UNAUTHORIZED,
				});
			}

			const payload = await encoder.decode<IdentifierPayload>(accessToken);

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

			return response.code(HttpStatus.OK).send();
		},
	);
};
