import { z } from "zod";

const rangeWithoutMetricsSchema = z.object({
	min: z.int(),
	max: z.int().optional(),
});

const rangeWithMetricsSchema = rangeWithoutMetricsSchema.extend({
	projectCount: z.int(),
	budgetSent: z.int(),
	budgetApproved: z.int(),
	approvalPercentage: z.number().min(0).max(1),
});

export const getValueDistributionSchema = z.object({
	ranges: z.array(rangeWithMetricsSchema),
});

export type RangeWithoutMetrics = z.infer<typeof rangeWithoutMetricsSchema>;
export type RangeWithMetrics = z.infer<typeof rangeWithMetricsSchema>;
