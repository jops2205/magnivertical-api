import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "@/database";
import { BudgetStatus } from "@/schemas/budgets/budget-schema";
import { idParamSchema } from "@/schemas/id-param-schema";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";
import { StateMachine } from "@/utils/state-machine";

export const updateBudgetStatusController: FastifyPluginAsyncZod = async (
	app,
) => {
	app.patch(
		"/status/:id",
		{
			preHandler: [app.authenticate, app.verified],
			schema: {
				summary: "Update Budget Status",
				operationId: "updateBudgetStatus",
				tags: ["budgets"],
				params: idParamSchema,
				body: z.object({ status: z.enum(BudgetStatus) }),
				response: {
					204: z.void(),
					404: responseSchema,
					409: responseSchema,
				},
			},
		},
		async (request, response) => {
			const { id: budgetId } = request.params;
			const { status } = request.body;

			const budget = await db.budget.findUnique({ where: { id: budgetId } });

			if (!budget) {
				return response.code(HttpStatus.NOT_FOUND).send({
					message: "Not found",
					statusCode: HttpStatus.NOT_FOUND,
				});
			}

			const state = new StateMachine<BudgetStatus>({
				DRAFT: [BudgetStatus.SENT],
				SENT: [
					BudgetStatus.UNDER_REVIEW,
					BudgetStatus.NOT_REQUESTED,
					BudgetStatus.REQUESTED,
				],
				UNDER_REVIEW: [BudgetStatus.SENT],
				NOT_REQUESTED: [],
				REQUESTED: [BudgetStatus.IN_PRODUCTION],
				IN_PRODUCTION: [BudgetStatus.PENDING_COMPLETION],
				PENDING_COMPLETION: [BudgetStatus.COMPLETED],
				COMPLETED: [],
			});

			const isValid = state.isTransitionValid(
				BudgetStatus[budget.status],
				status,
			);

			if (!isValid) {
				return response.code(HttpStatus.CONFLICT).send({
					message: "Conflict",
					statusCode: HttpStatus.CONFLICT,
				});
			}

			await db.budget.update({
				where: { id: budget.id },
				data: { status },
			});

			return response.code(HttpStatus.NO_CONTENT).send();
		},
	);
};
