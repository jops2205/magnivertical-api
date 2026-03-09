import { z } from "zod";

export enum HttpStatus {
	OK = 200,
	CREATED = 201,
	NO_CONTENT = 204,
	FOUND = 302,
	BAD_REQUEST = 400,
	UNAUTHORIZED = 401,
	FORBIDDEN = 403,
	NOT_FOUND = 404,
	CONFLICT = 409,
	TOO_MANY_REQUESTS = 429,
	INTERNAL_SERVER_ERROR = 500,
}

export const responseSchema = z.object({
	message: z.enum([
		"Ok",
		"Create",
		"No content",
		"Found",
		"Bad request",
		"Unauthorized",
		"Forbidden",
		"Not found",
		"Conflict",
		"Too many requests",
		"Internal server error",
	]),
	error: z.string().min(1).optional(),
	statusCode: z.enum(HttpStatus),
});

export type Response = z.infer<typeof responseSchema>;
