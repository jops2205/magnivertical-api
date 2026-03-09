import { z } from "zod";

export const requestAuthenticationSchema = z.object({
	email: z.email(),
	password: z.string().min(1),
});

export type RequestAuthenticationData = z.infer<
	typeof requestAuthenticationSchema
>;
