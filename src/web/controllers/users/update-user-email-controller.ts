import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { cache } from "@/cache/redis-cache";
import { db } from "@/database";
import { env } from "@/env";
import { mailer } from "@/mail/resend-mailer";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";
import { CacheKeys } from "@/utils/enums/cache-keys";
import { generator } from "@/utils/token-generator";

export const updateUserEmailController: FastifyPluginAsyncZod = async (app) => {
	app.patch(
		"/email",
		{
			preHandler: [app.authenticate, app.verified],
			schema: {
				summary: "Update User Email",
				operationId: "updateUserEmail",
				tags: ["users"],
				body: z.object({ email: z.email() }),
				response: {
					204: z.void(),
					404: responseSchema,
					409: responseSchema,
				},
			},
		},
		async (request, response) => {
			const { id: userId } = request.user;
			const { email } = request.body;

			const user = await db.user.findUnique({ where: { id: userId } });

			if (!user) {
				return response.code(HttpStatus.NOT_FOUND).send();
			}

			const isEmailUsed = await db.user.findUnique({ where: { email } });

			if (isEmailUsed && user.id !== isEmailUsed.id) {
				return response.code(HttpStatus.CONFLICT).send({
					message: "Conflict",
					error: `Este endereço de e-mail já está em uso por ${isEmailUsed.name}.`,
					statusCode: HttpStatus.CONFLICT,
				});
			}

			if (user.email !== email) {
				user.verified = false;
			}

			await db.user.update({
				where: { id: user.id },
				data: {
					email,
					verified: user.verified,
				},
			});

			await cache.delete(`${CacheKeys.CURRENT_USER}:${user.id}`);

			if (!user.verified) {
				const token = await generator.generateVerificationToken(user.id);

				const url = new URL(
					`users/verify/${token}`,
					env.get("APP_URL"),
				).toString();

				await mailer.send({
					to: email,
					subject: "Confirme o seu endereço de e-mail",
					name: "user-verification",
					context: {
						url,
						email,
					},
				});
			}

			return response.code(HttpStatus.NO_CONTENT).send();
		},
	);
};
