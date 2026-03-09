import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { fastifyPlugin } from "fastify-plugin";
import { HttpStatus, type Response } from "@/schemas/response-schema";
import { encoder } from "@/security/jwt-encoder";
import { Cookies } from "@/utils/enums/cookies";
import type { UserPayload } from "@/utils/token-generator";

export const authenticate = fastifyPlugin((app: FastifyInstance) => {
	app.decorate(
		"authenticate",
		async (request: FastifyRequest, response: FastifyReply) => {
			const accessToken = request.cookies[Cookies.ACCESS_TOKEN];

			if (!accessToken) {
				return response.code(HttpStatus.UNAUTHORIZED).send({
					message: "Unauthorized",
					statusCode: HttpStatus.UNAUTHORIZED,
				} satisfies Response);
			}

			const payload = await encoder.decode<UserPayload>(accessToken);

			if (!payload) {
				return response.code(HttpStatus.UNAUTHORIZED).send({
					message: "Unauthorized",
					statusCode: HttpStatus.UNAUTHORIZED,
				} satisfies Response);
			}

			request.user = payload;
		},
	);
});
