import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "@/database";
import { customerMapper } from "@/database/mappers/customer-mapper";
import { customerSchema } from "@/schemas/customers/customer-schema";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";
import { UserRole } from "@/schemas/users/user-schema";

export const getCustomersWithoutQueryController: FastifyPluginAsyncZod = async (
	app,
) => {
	app.get(
		"/index/no-query",
		{
			preHandler: [
				app.authenticate,
				app.roles(UserRole.MANAGER, UserRole.ASSISTANT),
				app.verified,
			],
			schema: {
				summary: "Get Customers Without Query",
				operationId: "getCustomersWithoutQuery",
				tags: ["customers"],
				response: {
					200: z.array(customerSchema),
					404: responseSchema,
				},
			},
		},
		async (_, response) => {
			const customers = await db.customer.findMany({
				include: { address: true },
			});

			return response.code(HttpStatus.OK).send(customers.map(customerMapper));
		},
	);
};
