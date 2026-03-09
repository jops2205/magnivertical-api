import type { FastifyInstance } from "fastify";
import { authenticate } from "../plugins/authenticate";
import { refresh } from "../plugins/refresh";
import { roles } from "../plugins/roles";
import { verified } from "../plugins/verified";
import { registerBudgetRoutes } from "./register-budget-routes";
import { registerCustomerRoutes } from "./register-customer-routes";
import { registerFollowUpRoutes } from "./register-follow-up-routes";
import { registerMetricRoutes } from "./register-metric-routes";
import { registerNotificationRoutes } from "./register-notification-routes";
import { registerProjectRoutes } from "./register-project-routes";
import { registerSessionRoutes } from "./register-session-routes";
import { registerTaskRoutes } from "./register-task-routes";
import { registerUserRoutes } from "./register-user-routes";

export const router = (app: FastifyInstance) => {
	app.register(authenticate);
	app.register(refresh);
	app.register(roles);
	app.register(verified);

	app.register(registerBudgetRoutes, { prefix: "/budgets" });
	app.register(registerCustomerRoutes, { prefix: "/customers" });
	app.register(registerFollowUpRoutes, { prefix: "/follow-ups" });
	app.register(registerMetricRoutes, { prefix: "/metrics" });
	app.register(registerNotificationRoutes, { prefix: "/notifications" });
	app.register(registerProjectRoutes, { prefix: "/projects" });
	app.register(registerSessionRoutes, { prefix: "/session" });
	app.register(registerTaskRoutes, { prefix: "/tasks" });
	app.register(registerUserRoutes, { prefix: "/users" });
};
