import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "@/database";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";

export const readNotificationsController: FastifyPluginAsyncZod = async (
	app,
) => {
	app.patch(
		"/read",
		{
			preHandler: [app.authenticate, app.verified],
			schema: {
				summary: "Read Notifications",
				operationId: "readNotifications",
				tags: ["notifications"],
				response: {
					204: z.void(),
					404: responseSchema,
				},
			},
		},
		async (request, response) => {
			const { id: userId } = request.user;

			await db.notification.updateMany({
				where: {
					read: false,
					userId,
				},
				data: {
					read: true,
					readAt: new Date(),
				},
			});

			return response.code(HttpStatus.NO_CONTENT).send();
		},
	);
};
