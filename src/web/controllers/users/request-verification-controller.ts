import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { env } from "@/env";
import { mailer } from "@/mail/resend-mailer";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";
import { generator } from "@/utils/token-generator";

export const requestVerificationController: FastifyPluginAsyncZod = async (
	app,
) => {
	app.post(
		"/verify/request",
		{
			preHandler: [app.authenticate],
			schema: {
				summary: "Request Verification",
				operationId: "requestVerification",
				tags: ["users"],
				body: z.object({ email: z.email() }),
				response: {
					200: z.void(),
					404: responseSchema,
				},
			},
		},
		async (request, response) => {
			const { id: userId } = request.user;
			const { email } = request.body;

			const token = await generator.generateVerificationToken(userId);

			const url = new URL(
				`users/verify/${token}`,
				env.get("APP_URL"),
			).toString();

			app.log.info(url);

			await mailer.send({
				to: email,
				subject: "Confirme o seu endereço de e-mail",
				name: "user-verification",
				context: {
					url,
					email,
				},
			});

			return response.code(HttpStatus.OK).send();
		},
	);
};
