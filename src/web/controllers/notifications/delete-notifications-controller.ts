import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "@/database";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";

export const deleteNotificationsController: FastifyPluginAsyncZod = async (
	app,
) => {
	app.delete(
		"/",
		{
			preHandler: [app.authenticate, app.verified],
			schema: {
				summary: "Delete Notifications",
				operationId: "deleteNotifications",
				tags: ["notifications"],
				response: {
					204: z.void(),
					404: responseSchema,
				},
			},
		},
		async (request, response) => {
			const { id: userId } = request.user;

			await db.notification.deleteMany({ where: { userId } });

			return response.code(HttpStatus.NO_CONTENT).send();
		},
	);
};
