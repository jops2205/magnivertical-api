import { z } from "zod";

export const getMetricsSchema = z
	.object({
		from: z.coerce.date(),
		to: z.coerce.date(),
	})
	.partial();

export type GetMetricsQuery = z.infer<typeof getMetricsSchema>;
