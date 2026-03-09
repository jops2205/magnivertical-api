import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { fastifyPlugin } from "fastify-plugin";
import { HttpStatus, type Response } from "@/schemas/response-schema";

export const verified = fastifyPlugin((app: FastifyInstance) => {
	app.decorate(
		"verified",
		async (request: FastifyRequest, response: FastifyReply) => {
			const { verified } = request.user;

			if (!verified) {
				return response.code(HttpStatus.FORBIDDEN).send({
					message: "Forbidden",
					statusCode: HttpStatus.FORBIDDEN,
				} satisfies Response);
			}
		},
	);
});
