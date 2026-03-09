import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "@/database";
import type { Prisma } from "@/database/generated/client";
import { userMapper } from "@/database/mappers/user-mapper";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";
import { getUsersSchema } from "@/schemas/users/get-users-schema";
import {
	UserRole,
	userWithoutPasswordSchema,
} from "@/schemas/users/user-schema";

export const getUsersController: FastifyPluginAsyncZod = async (app) => {
	app.get(
		"/index",
		{
			preHandler: [app.authenticate, app.roles(UserRole.MANAGER), app.verified],
			schema: {
				summary: "Get Users",
				operationId: "getUsers",
				tags: ["users"],
				querystring: getUsersSchema,
				response: {
					200: z.object({
						users: z.array(userWithoutPasswordSchema),
						count: z.int(),
					}),
					404: responseSchema,
				},
			},
		},
		async (request, response) => {
			const { id: userId } = request.user;

			const {
				page = 1,
				perPage = 10,
				order,
				search,
				role,
				verified,
			} = request.query;

			const userWhere: Prisma.UserWhereInput = {
				id: { not: userId },
				...(role && { role }),
				...(typeof verified === "boolean" && { verified }),
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

			const [userCount, users] = await Promise.all([
				db.user.count({ where: userWhere }),
				db.user.findMany({
					where: userWhere,
					skip: (page - 1) * perPage,
					take: perPage,
					orderBy: {
						...(order && { name: order }),
						...(!order && { createdAt: "desc" }),
					},
				}),
			]);

			return response.code(HttpStatus.OK).send({
				users: users.map(userMapper),
				count: userCount,
			});
		},
	);
};
