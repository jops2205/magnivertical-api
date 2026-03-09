import "fastify";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { UserRole } from "./schemas/users/user-schema";
import type { UserPayload } from "./utils/token-generator";

declare module "fastify" {
	interface FastifyInstance {
		authenticate(request: FastifyRequest, response: FastifyReply): void;

		refresh(request: FastifyRequest, response: FastifyReply): void;

		roles(
			...roles: UserRole[]
		): (request: FastifyRequest, response: FastifyReply) => void;

		verified(request: FastifyRequest, response: FastifyReply): void;
	}

	interface FastifyRequest {
		user: UserPayload;
	}
}
