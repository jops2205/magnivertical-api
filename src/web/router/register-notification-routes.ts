import type { FastifyInstance } from "fastify";
import { deleteNotificationController } from "../controllers/notifications/delete-notification-controller";
import { deleteNotificationsController } from "../controllers/notifications/delete-notifications-controller";
import { getNotificationsController } from "../controllers/notifications/get-notifications-controller";
import { readNotificationController } from "../controllers/notifications/read-notification-controller";
import { readNotificationsController } from "../controllers/notifications/read-notifications-controller";

export const registerNotificationRoutes = (app: FastifyInstance) => {
	app.register(deleteNotificationController);
	app.register(deleteNotificationsController);
	app.register(getNotificationsController);
	app.register(readNotificationController);
	app.register(readNotificationsController);
};
