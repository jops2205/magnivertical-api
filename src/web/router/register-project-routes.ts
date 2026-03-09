import type { FastifyInstance } from "fastify";
import { createProjectController } from "../controllers/projects/create-project-controller";
import { deleteProjectController } from "../controllers/projects/delete-project-controller";
import { getProjectBudgetsController } from "../controllers/projects/get-project-budgets-controller";
import { getProjectController } from "../controllers/projects/get-project-controller";
import { getProjectFollowUpsController } from "../controllers/projects/get-project-follow-ups-controller";
import { getProjectsController } from "../controllers/projects/get-projects-controller";
import { updateProjectController } from "../controllers/projects/update-project-controller";
import { updateProjectStatusController } from "../controllers/projects/update-project-status-controller";

export const registerProjectRoutes = (app: FastifyInstance) => {
	app.register(createProjectController);
	app.register(deleteProjectController);
	app.register(getProjectController);
	app.register(getProjectFollowUpsController);
	app.register(getProjectBudgetsController);
	app.register(getProjectsController);
	app.register(updateProjectController);
	app.register(updateProjectStatusController);
};
