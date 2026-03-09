import type { FastifyInstance } from "fastify";
import { getBudgetItemTypeRevenueController } from "../controllers/metrics/get-budget-item-type-revenue-controller";
import { getCustomerTypeRevenueController } from "../controllers/metrics/get-customer-type-revenue-controller";
import { getDistrictRevenueController } from "../controllers/metrics/get-district-revenue-controller";
import { getValueDistributionController } from "../controllers/metrics/get-value-distribution-controller";

export const registerMetricRoutes = (app: FastifyInstance) => {
	app.register(getBudgetItemTypeRevenueController);
	app.register(getCustomerTypeRevenueController);
	app.register(getDistrictRevenueController);
	app.register(getValueDistributionController);
};
