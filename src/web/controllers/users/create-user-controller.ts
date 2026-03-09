import { randomBytes } from "node:crypto";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "@/database";
import { env } from "@/env";
import { mailer } from "@/mail/resend-mailer";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";
import { createUserSchema } from "@/schemas/users/create-user-schema";
import { UserRole } from "@/schemas/users/user-schema";
import { hasher } from "@/security/password-hasher";
import { generator } from "@/utils/token-generator";

const generateRandomPassword = (length: number) => {
	return randomBytes(length).toString("base64").slice(0, length).toUpperCase();
};

export const createUserController: FastifyPluginAsyncZod = async (app) => {
	app.post(
		"/",
		{
			preHandler: [app.authenticate, app.roles(UserRole.MANAGER), app.verified],
			schema: {
				summary: "Create User",
				operationId: "createUser",
				tags: ["users"],
				body: createUserSchema,
				response: {
					201: z.void(),
					404: responseSchema,
					409: responseSchema,
				},
			},
		},
		async (request, response) => {
			const { name, email, role } = request.body;

			const isEmailUsed = await db.user.findUnique({ where: { email } });

			if (isEmailUsed) {
				return response.code(HttpStatus.CONFLICT).send({
					message: "Conflict",
					error: `Este endereço de e-mail já está em uso por ${isEmailUsed.name}.`,
					statusCode: HttpStatus.CONFLICT,
				});
			}

			const password = generateRandomPassword(12);
			const hashedPassword = await hasher.hash(password);

			const createdUser = await db.user.create({
				data: {
					name,
					email,
					password: hashedPassword,
					role,
				},
			});

			const token = await generator.generateVerificationToken(createdUser.id);

			const url = new URL(
				`users/verify/${token}`,
				env.get("APP_URL"),
			).toString();

			await mailer.send({
				to: email,
				subject: "Finalize o registo: confirme o seu endereço de e-mail",
				name: "user-creation",
				context: {
					url,
					email,
					password,
				},
			});

			return response.code(HttpStatus.CREATED).send();
		},
	);
};
