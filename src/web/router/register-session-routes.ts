import type { FastifyInstance } from "fastify";
import { authenticateUserController } from "../controllers/session/authenticate-user-controller";
import { refreshSessionController } from "../controllers/session/refresh-session-controller";
import { requestAuthenticationController } from "../controllers/session/request-authentication-controller";
import { signOutController } from "../controllers/session/sign-out-controller";

export const registerSessionRoutes = (app: FastifyInstance) => {
	app.register(authenticateUserController);
	app.register(refreshSessionController);
	app.register(requestAuthenticationController);
	app.register(signOutController);
};
