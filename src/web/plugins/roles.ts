import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { fastifyPlugin } from "fastify-plugin";
import { HttpStatus, type Response } from "@/schemas/response-schema";
import type { UserRole } from "@/schemas/users/user-schema";

export const roles = fastifyPlugin((app: FastifyInstance) => {
	app.decorate("roles", (...roles: UserRole[]) => {
		return async (request: FastifyRequest, response: FastifyReply) => {
			const { role } = request.user;

			if (!roles.includes(role)) {
				return response.code(HttpStatus.FORBIDDEN).send({
					message: "Forbidden",
					statusCode: HttpStatus.FORBIDDEN,
				} satisfies Response);
			}
		};
	});
});
