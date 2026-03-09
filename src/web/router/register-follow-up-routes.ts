import type { FastifyInstance } from "fastify";
import { updateFollowUpController } from "../controllers/follow-ups/update-follow-up-controller";

export const registerFollowUpRoutes = (app: FastifyInstance) => {
	app.register(updateFollowUpController);
};
