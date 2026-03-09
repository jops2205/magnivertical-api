import { z } from "zod";

const customerTypeRevenueSchema = z.object({
	revenue: z.int(),
	percentage: z.number().min(0).max(1),
});

export const getCustomerTypeRevenueSchema = z.object({
	business: customerTypeRevenueSchema,
	individual: customerTypeRevenueSchema,
});

export type CustomerTypeRevenue = z.infer<typeof customerTypeRevenueSchema>;
