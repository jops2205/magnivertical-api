import type { FastifyInstance } from "fastify";
import { createCustomerController } from "../controllers/customers/create-customer-controller";
import { deleteCustomerController } from "../controllers/customers/delete-customer-controller";
import { getCustomerController } from "../controllers/customers/get-customer-controller";
import { getCustomersController } from "../controllers/customers/get-customers-controller";
import { getCustomersWithoutQueryController } from "../controllers/customers/get-customers-without-query-controller";
import { updateCustomerController } from "../controllers/customers/update-customer-controller";

export const registerCustomerRoutes = (app: FastifyInstance) => {
	app.register(createCustomerController);
	app.register(deleteCustomerController);
	app.register(getCustomerController);
	app.register(getCustomersController);
	app.register(getCustomersWithoutQueryController);
	app.register(updateCustomerController);
};
