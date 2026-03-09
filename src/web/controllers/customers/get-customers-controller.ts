import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "@/database";
import type { Prisma } from "@/database/generated/client";
import { customerMapper } from "@/database/mappers/customer-mapper";
import { customerSchema } from "@/schemas/customers/customer-schema";
import { getCustomersSchema } from "@/schemas/customers/get-customers-schema";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";
import { UserRole } from "@/schemas/users/user-schema";

export const getCustomersController: FastifyPluginAsyncZod = async (app) => {
	app.get(
		"/index",
		{
			preHandler: [
				app.authenticate,
				app.roles(UserRole.MANAGER, UserRole.ASSISTANT),
				app.verified,
			],
			schema: {
				summary: "Get Customers",
				operationId: "getCustomers",
				tags: ["customers"],
				querystring: getCustomersSchema,
				response: {
					200: z.object({
						customers: z.array(customerSchema),
						count: z.int(),
					}),
					404: responseSchema,
				},
			},
		},
		async (request, response) => {
			const { page = 1, perPage = 10, order, search, type } = request.query;

			const customerWhere: Prisma.CustomerWhereInput = {
				...(type && { type }),
				...(search && {
					OR: [
						{
							name: {
								contains: search,
								mode: "insensitive",
							},
						},
						{
							email: {
								contains: search,
								mode: "insensitive",
							},
						},
					],
				}),
			};

			const [customerCount, customers] = await Promise.all([
				db.customer.count({ where: customerWhere }),
				db.customer.findMany({
					where: customerWhere,
					include: { address: true },
					skip: (page - 1) * perPage,
					take: perPage,
					orderBy: {
						...(order && { name: order }),
						...(!order && { createdAt: "desc" }),
					},
				}),
			]);

			return response.code(HttpStatus.OK).send({
				customers: customers.map(customerMapper),
				count: customerCount,
			});
		},
	);
};
