import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "@/database";
import { FollowUpStatus } from "@/schemas/follow-ups/follow-up-schema";
import { updateFollowUpSchema } from "@/schemas/follow-ups/update-follow-up-schema";
import { idParamSchema } from "@/schemas/id-param-schema";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";
import { UserRole } from "@/schemas/users/user-schema";
import { StateMachine } from "@/utils/state-machine";

export const updateFollowUpController: FastifyPluginAsyncZod = async (app) => {
	app.put(
		"/:id",
		{
			preHandler: [
				app.authenticate,
				app.roles(UserRole.MANAGER, UserRole.ASSISTANT),
				app.verified,
			],
			schema: {
				summary: "Update Follow-Up",
				operationId: "updateFollowUp",
				tags: ["follow-ups"],
				params: idParamSchema,
				body: updateFollowUpSchema,
				response: {
					201: z.void(),
					204: z.void(),
					404: responseSchema,
					409: responseSchema,
				},
			},
		},
		async (request, response) => {
			const { id: userId } = request.user;
			const { id: followUpId } = request.params;
			const { description, status, nextSchedule } = request.body;

			const followUp = await db.followUp.findUnique({
				where: { id: followUpId },
			});

			if (!followUp) {
				return response.code(HttpStatus.NOT_FOUND).send({
					message: "Not found",
					statusCode: HttpStatus.NOT_FOUND,
				});
			}

			const state = new StateMachine<FollowUpStatus>({
				PENDING: [FollowUpStatus.COMPLETED, FollowUpStatus.CLOSED],
				COMPLETED: [],
				CLOSED: [],
			});

			const isValid = state.isTransitionValid(
				FollowUpStatus[followUp.status],
				status,
			);

			if (!isValid) {
				return response.code(HttpStatus.CONFLICT).send({
					message: "Conflict",
					statusCode: HttpStatus.CONFLICT,
				});
			}

			await db.followUp.update({
				where: { id: followUp.id },
				data: {
					description,
					status,
					resolvedAt: new Date(),
				},
			});

			if (status === FollowUpStatus.COMPLETED && nextSchedule) {
				await db.followUp.create({
					data: {
						scheduledAt: nextSchedule,
						budget: {
							connect: { id: followUp.budgetId },
						},
						user: {
							connect: { id: userId },
						},
					},
				});

				return response.code(HttpStatus.CREATED).send();
			}

			return response.code(HttpStatus.NO_CONTENT).send();
		},
	);
};
