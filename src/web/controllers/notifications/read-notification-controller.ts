import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "@/database";
import { idParamSchema } from "@/schemas/id-param-schema";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";

export const readNotificationController: FastifyPluginAsyncZod = async (
	app,
) => {
	app.patch(
		"/read/:id",
		{
			preHandler: [app.authenticate, app.verified],
			schema: {
				summary: "Read Notification",
				operationId: "readNotification",
				tags: ["notifications"],
				params: idParamSchema,
				response: {
					204: z.void(),
					404: responseSchema,
				},
			},
		},
		async (request, response) => {
			const { id: userId } = request.user;
			const { id: notificationId } = request.params;

			const notification = await db.notification.findUnique({
				where: {
					id: notificationId,
					read: false,
					userId,
				},
			});

			if (!notification) {
				return response.code(HttpStatus.NOT_FOUND).send({
					message: "Not found",
					statusCode: HttpStatus.NOT_FOUND,
				});
			}

			await db.notification.update({
				where: {
					id: notification.id,
					read: false,
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
