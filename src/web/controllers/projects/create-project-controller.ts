import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "@/database";
import { createProjectSchema } from "@/schemas/projects/create-project-schema";
import { HttpStatus, responseSchema } from "@/schemas/response-schema";
import { UserRole } from "@/schemas/users/user-schema";

export const createProjectController: FastifyPluginAsyncZod = async (app) => {
	app.post(
		"/",
		{
			preHandler: [
				app.authenticate,
				app.roles(UserRole.MANAGER, UserRole.ASSISTANT),
				app.verified,
			],
			schema: {
				summary: "Create Project",
				operationId: "createProject",
				tags: ["projects"],
				body: createProjectSchema,
				response: {
					201: z.void(),
					404: responseSchema,
				},
			},
		},
		async (request, response) => {
			const { name, customerId, address } = request.body;

			const customer = await db.customer.findUnique({
				where: { id: customerId },
			});

			if (!customer) {
				return response.code(HttpStatus.NOT_FOUND).send({
					message: "Not found",
					statusCode: HttpStatus.NOT_FOUND,
				});
			}

			const currentYear = new Date().getFullYear();

			const lastCreatedProject = await db.project.findFirst({
				orderBy: {
					startedAt: "desc",
				},
			});

			let code = 1;

			if (lastCreatedProject) {
				const lastCreatedProjectYear = Number(
					lastCreatedProject.code.split("/")[1],
				);

				if (lastCreatedProjectYear === currentYear) {
					code = Number(lastCreatedProject.code.split("/")[0]) + 1;
				}
			}

			const formattedCode = code.toString().padStart(3, "0");

			await db.project.create({
				data: {
					name,
					code: `${formattedCode}/${currentYear}`,
					customer: {
						connect: { id: customer.id },
					},
					address: {
						create: address,
					},
				},
			});

			return response.code(HttpStatus.CREATED).send();
		},
	);
};
