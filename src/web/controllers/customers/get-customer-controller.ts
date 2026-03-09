import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "@/database";
import { customerMapper } from "@/database/mappers/customer-mapper";
import { customerSchema } from "@/schemas/customers/customer-schema";
import { idParamSchema } from "@/schemas/id-param-schema";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";
import { UserRole } from "@/schemas/users/user-schema";

export const getCustomerController: FastifyPluginAsyncZod = async (app) => {
	app.get(
		"/:id",
		{
			preHandler: [
				app.authenticate,
				app.roles(UserRole.MANAGER, UserRole.ASSISTANT),
				app.verified,
			],
			schema: {
				summary: "Get Customer",
				operationId: "getCustomer",
				tags: ["customers"],
				params: idParamSchema,
				response: {
					200: customerSchema,
					404: responseSchema,
				},
			},
		},
		async (request, response) => {
			const { id: customerId } = request.params;

			const customer = await db.customer.findUnique({
				where: { id: customerId },
				include: { address: true },
			});

			if (!customer) {
				return response.code(HttpStatus.NOT_FOUND).send({
					message: "Not found",
					statusCode: HttpStatus.NOT_FOUND,
				});
			}

			return response.code(HttpStatus.OK).send(customerMapper(customer));
		},
	);
};
