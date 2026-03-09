import type { FastifyInstance } from "fastify";
import { createBudgetController } from "../controllers/budgets/create-budget-controller";
import { deleteBudgetController } from "../controllers/budgets/delete-budget-controller";
import { getBudgetReportsController } from "../controllers/budgets/get-budget-reports-controller";
import { getBudgetsToBeCompletedController } from "../controllers/budgets/get-budgets-to-be-completed-controller";
import { updateBudgetController } from "../controllers/budgets/update-budget-controller";
import { updateBudgetStatusController } from "../controllers/budgets/update-budget-status-controller";

export const registerBudgetRoutes = (app: FastifyInstance) => {
	app.register(createBudgetController);
	app.register(deleteBudgetController);
	app.register(getBudgetReportsController);
	app.register(getBudgetsToBeCompletedController);
	app.register(updateBudgetController);
	app.register(updateBudgetStatusController);
};
