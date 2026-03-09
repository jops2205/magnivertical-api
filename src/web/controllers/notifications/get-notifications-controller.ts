import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "@/database";
import { notificationMapper } from "@/database/mappers/notification-mapper";
import { notificationSchema } from "@/schemas/notifications/notification-schema";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";

export const getNotificationsController: FastifyPluginAsyncZod = async (
	app,
) => {
	app.get(
		"/index",
		{
			preHandler: [app.authenticate, app.verified],
			schema: {
				summary: "Get Notifications",
				operationId: "getNotifications",
				tags: ["notifications"],
				response: {
					200: z.array(notificationSchema),
					404: responseSchema,
				},
			},
		},
		async (request, response) => {
			const { id: userId } = request.user;

			const notifications = await db.notification.findMany({
				where: { userId },
				orderBy: { createdAt: "desc" },
			});

			return response
				.code(HttpStatus.OK)
				.send(notifications.map(notificationMapper));
		},
	);
};
