import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { cache } from "@/cache/redis-cache";
import { db } from "@/database";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";
import { updateUserPasswordSchema } from "@/schemas/users/update-user-password-schema";
import { hasher } from "@/security/password-hasher";
import { CacheKeys } from "@/utils/enums/cache-keys";

export const updateUserPasswordController: FastifyPluginAsyncZod = async (
	app,
) => {
	app.patch(
		"/password",
		{
			preHandler: [app.authenticate, app.verified],
			schema: {
				summary: "Update User Password",
				operationId: "updateUserPassword",
				tags: ["users"],
				body: updateUserPasswordSchema,
				response: {
					204: z.void(),
					401: responseSchema,
					404: responseSchema,
					409: responseSchema,
				},
			},
		},
		async (request, response) => {
			const { id: userId } = request.user;
			const { oldPassword, newPassword } = request.body;

			const user = await db.user.findUnique({ where: { id: userId } });

			if (!user) {
				return response.code(HttpStatus.NOT_FOUND).send();
			}

			if (oldPassword === newPassword) {
				return response.code(HttpStatus.CONFLICT).send({
					message: "Conflict",
					error: "A nova palavra-passe deve ser diferente da atual.",
					statusCode: HttpStatus.CONFLICT,
				});
			}

			const isPasswordValid = await hasher.compare(oldPassword, user.password);

			if (!isPasswordValid) {
				return response.code(HttpStatus.UNAUTHORIZED).send({
					message: "Unauthorized",
					error: "A palavra-passe atual está incorreta.",
					statusCode: HttpStatus.UNAUTHORIZED,
				});
			}

			const hashedPassword = await hasher.hash(newPassword);

			await db.user.update({
				where: { id: user.id },
				data: { password: hashedPassword },
			});

			await cache.delete(`${CacheKeys.CURRENT_USER}:${user.id}`);

			return response.code(HttpStatus.NO_CONTENT).send();
		},
	);
};
