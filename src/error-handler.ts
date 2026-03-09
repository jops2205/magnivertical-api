import type { FastifyInstance } from "fastify";
import { hasZodFastifySchemaValidationErrors } from "fastify-type-provider-zod";
import { HttpStatus, type Response } from "./schemas/response-schema";

type FastifyErrorHandler = FastifyInstance["errorHandler"];

type FastifySchemaValidationError = {
	path: string;
	message?: string;
};

export const errorHandler: FastifyErrorHandler = (error, _, response) => {
	if (hasZodFastifySchemaValidationErrors(error)) {
		return response.code(HttpStatus.BAD_REQUEST).send({
			message: "Bad request",
			error: error.validation.map(({ instancePath, message }) => ({
				path: instancePath.replace(/^\//, "").replace(/\//g, "."),
				message,
			})),
			statusCode: HttpStatus.BAD_REQUEST,
		} satisfies Omit<Response, "error"> & {
			error: FastifySchemaValidationError[];
		});
	}

	return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
		message: "Internal server error",
		statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
	} satisfies Response);
};
