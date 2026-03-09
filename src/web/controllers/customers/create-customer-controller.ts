import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "@/database";
import { createCustomerSchema } from "@/schemas/customers/create-customer-schema";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";
import { UserRole } from "@/schemas/users/user-schema";

export const createCustomerController: FastifyPluginAsyncZod = async (app) => {
	app.post(
		"/",
		{
			preHandler: [
				app.authenticate,
				app.roles(UserRole.MANAGER, UserRole.ASSISTANT),
				app.verified,
			],
			schema: {
				summary: "Create Customer",
				operationId: "createCustomer",
				tags: ["customers"],
				body: createCustomerSchema,
				response: {
					201: z.void(),
					404: responseSchema,
					409: responseSchema,
				},
			},
		},
		async (request, response) => {
			const { name, email, phone, taxpayer, type, address } = request.body;

			const [isEmailUsed, isPhoneUsed, isTaxpayerUsed] = await Promise.all([
				db.customer.findUnique({ where: { email } }),
				db.customer.findUnique({ where: { phone } }),
				db.customer.findUnique({ where: { taxpayer } }),
			]);

			if (isEmailUsed) {
				return response.code(HttpStatus.CONFLICT).send({
					message: "Conflict",
					error: "Este endereço de e-mail já está associado a outro cliente.",
					statusCode: HttpStatus.CONFLICT,
				});
			}

			if (isPhoneUsed) {
				return response.code(HttpStatus.CONFLICT).send({
					message: "Conflict",
					error: "Este número de telefone já está associado a outro cliente.",
					statusCode: HttpStatus.CONFLICT,
				});
			}

			if (isTaxpayerUsed) {
				return response.code(HttpStatus.CONFLICT).send({
					message: "Conflict",
					error: "Este contribuinte já está associado a outro cliente.",
					statusCode: HttpStatus.CONFLICT,
				});
			}

			await db.customer.create({
				data: {
					name,
					email,
					phone,
					taxpayer,
					type,
					address: {
						create: address,
					},
				},
			});

			return response.code(HttpStatus.CREATED).send();
		},
	);
};
