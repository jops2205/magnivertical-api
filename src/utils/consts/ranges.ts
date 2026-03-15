import type { RangeWithoutMetrics } from "@/schemas/metrics/value-distribution-schema";

export const RANGES: RangeWithoutMetrics[] = [
	{
		min: 0,
		max: 500000,
	},
	{
		min: 500000,
		max: 1000000,
	},
	{
		min: 1000000,
		max: 5000000,
	},
	{
		min: 5000000,
		max: 10000000,
	},
	{
		min: 10000000,
		max: 20000000,
	},
	{
		min: 20000000,
	},
] as const;
