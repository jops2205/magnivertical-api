import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "@/database";
import { updateCustomerSchema } from "@/schemas/customers/update-customer-schema";
import { idParamSchema } from "@/schemas/id-param-schema";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";
import { UserRole } from "@/schemas/users/user-schema";

export const updateCustomerController: FastifyPluginAsyncZod = async (app) => {
	app.put(
		"/:id",
		{
			preHandler: [app.authenticate, app.roles(UserRole.MANAGER), app.verified],
			schema: {
				summary: "Update Customer",
				operationId: "updateCustomer",
				tags: ["customers"],
				params: idParamSchema,
				body: updateCustomerSchema,
				response: {
					204: z.void(),
					404: responseSchema,
					409: responseSchema,
				},
			},
		},
		async (request, response) => {
			const { id: customerId } = request.params;
			const { name, email, phone, taxpayer, type, address } = request.body;

			const customer = await db.customer.findUnique({
				where: { id: customerId },
			});

			if (!customer) {
				return response.code(HttpStatus.NOT_FOUND).send({
					message: "Not found",
					statusCode: HttpStatus.NOT_FOUND,
				});
			}

			const [isEmailUsed, isPhoneUsed, isTaxpayerUsed] = await Promise.all([
				db.customer.findUnique({ where: { email } }),
				db.customer.findUnique({ where: { phone } }),
				db.customer.findUnique({ where: { taxpayer } }),
			]);

			if (isEmailUsed && customer.id !== isEmailUsed.id) {
				return response.code(HttpStatus.CONFLICT).send({
					message: "Conflict",
					error: "Este endereço de e-mail já está associado a outro cliente.",
					statusCode: HttpStatus.CONFLICT,
				});
			}

			if (isPhoneUsed && customer.id !== isPhoneUsed.id) {
				return response.code(HttpStatus.CONFLICT).send({
					message: "Conflict",
					error: "Este número de telefone já está associado a outro cliente.",
					statusCode: HttpStatus.CONFLICT,
				});
			}

			if (isTaxpayerUsed && customer.id !== isTaxpayerUsed.id) {
				return response.code(HttpStatus.CONFLICT).send({
					message: "Conflict",
					error: "Este contribuinte já está associado a outro cliente.",
					statusCode: HttpStatus.CONFLICT,
				});
			}

			await db.customer.update({
				where: { id: customer.id },
				data: {
					name,
					email,
					phone,
					taxpayer,
					type,
					address: {
						update: address,
					},
				},
			});

			return response.code(HttpStatus.NO_CONTENT).send();
		},
	);
};
