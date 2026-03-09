import { z } from "zod";

export const queryParamsSchema = z
	.object({
		page: z.coerce.number(),
		perPage: z.coerce.number(),
		order: z.enum(["asc", "desc"]),
		search: z.string().min(1),
	})
	.partial();

export type QueryParams = z.infer<typeof queryParamsSchema>;
