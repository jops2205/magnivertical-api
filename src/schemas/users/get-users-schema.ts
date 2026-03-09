import { z } from "zod";
import { queryParamsSchema } from "../query-params-schema";
import { UserRole } from "./user-schema";

export const getUsersSchema = queryParamsSchema
	.extend({
		role: z.enum(UserRole),
		verified: z.stringbool(),
	})
	.partial();

export type GetUsersQuery = z.infer<typeof getUsersSchema>;
