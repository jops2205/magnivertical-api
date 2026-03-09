import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { cache } from "@/cache/redis-cache";
import { db } from "@/database";
import { env } from "@/env";
import { mailer } from "@/mail/resend-mailer";
import { idParamSchema } from "@/schemas/id-param-schema";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";
import { updateUserSchema } from "@/schemas/users/update-user-schema";
import { UserRole } from "@/schemas/users/user-schema";
import { CacheKeys } from "@/utils/enums/cache-keys";
import { generator } from "@/utils/token-generator";

export const updateUserController: FastifyPluginAsyncZod = async (app) => {
	app.put(
		"/:id",
		{
			preHandler: [app.authenticate, app.roles(UserRole.MANAGER), app.verified],
			schema: {
				summary: "Update User",
				operationId: "updateUser",
				tags: ["users"],
				params: idParamSchema,
				body: updateUserSchema,
				response: {
					204: z.void(),
					409: responseSchema,
					404: responseSchema,
				},
			},
		},
		async (request, response) => {
			const { id: userToUpdateId } = request.params;
			const { name, email, role } = request.body;

			const user = await db.user.findUnique({ where: { id: userToUpdateId } });

			if (!user) {
				return response.code(HttpStatus.NOT_FOUND).send({
					message: "Not found",
					statusCode: HttpStatus.NOT_FOUND,
				});
			}

			const isEmailUsed = await db.user.findUnique({ where: { email } });

			if (isEmailUsed && user.id !== isEmailUsed.id) {
				return response.code(HttpStatus.CONFLICT).send({
					message: "Conflict",
					error: `Este endereço de email já está em uso por ${isEmailUsed.name}.`,
					statusCode: HttpStatus.CONFLICT,
				});
			}

			if (user.email !== email) {
				user.verified = false;
			}

			await db.user.update({
				where: { id: user.id },
				data: {
					name,
					email,
					role,
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
