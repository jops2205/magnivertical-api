import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "@/database";
import { env } from "@/env";
import { mailer } from "@/mail/resend-mailer";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";
import { requestAuthenticationSchema } from "@/schemas/session/request-authentication-schema";
import { hasher } from "@/security/password-hasher";
import { generator } from "@/utils/token-generator";

export const requestAuthenticationController: FastifyPluginAsyncZod = async (
	app,
) => {
	app.post(
		"/request",
		{
			schema: {
				summary: "Request Authentication",
				operationId: "requestAuthentication",
				tags: ["session"],
				body: requestAuthenticationSchema,
				response: {
					200: z.void(),
					401: responseSchema,
					404: responseSchema,
				},
			},
		},
		async (request, response) => {
			const { email, password } = request.body;

			const user = await db.user.findUnique({ where: { email } });

			if (!user) {
				return response.code(HttpStatus.NOT_FOUND).send({
					message: "Not found",
					error:
						"Não foi possível localizar uma conta associada a este endereço de e-mail.",
					statusCode: HttpStatus.NOT_FOUND,
				});
			}

			const isPasswordValid = await hasher.compare(password, user.password);

			if (!isPasswordValid) {
				return response.code(HttpStatus.UNAUTHORIZED).send({
					message: "Unauthorized",
					error: "A palavra-passe introduzida está incorreta.",
					statusCode: HttpStatus.UNAUTHORIZED,
				});
			}

			const token = await generator.generateAuthenticationToken(user.id);

			const url = new URL(
				`session/authenticate/${token}`,
				env.get("APP_URL"),
			).toString();

			await mailer.send({
				to: email,
				subject: "O seu link de acesso está pronto",
				name: "user-authentication",
				context: {
					url,
					email,
				},
			});

			return response.code(HttpStatus.OK).send();
		},
	);
};
