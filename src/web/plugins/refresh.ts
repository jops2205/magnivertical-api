import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { fastifyPlugin } from "fastify-plugin";
import { HttpStatus, type Response } from "@/schemas/response-schema";
import { encoder } from "@/security/jwt-encoder";
import { Cookies } from "@/utils/enums/cookies";

export const refresh = fastifyPlugin((app: FastifyInstance) => {
	app.decorate(
		"refresh",
		async (request: FastifyRequest, response: FastifyReply) => {
			const refreshToken = request.cookies[Cookies.REFRESH_TOKEN];

			if (!refreshToken) {
				return response.code(HttpStatus.UNAUTHORIZED).send({
					message: "Unauthorized",
					statusCode: HttpStatus.UNAUTHORIZED,
				} satisfies Response);
			}

			const payload = await encoder.decode(refreshToken);

			if (!payload) {
				return response.code(HttpStatus.UNAUTHORIZED).send({
					message: "Unauthorized",
					statusCode: HttpStatus.UNAUTHORIZED,
				} satisfies Response);
			}
		},
	);
});
