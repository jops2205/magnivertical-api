import { z } from "zod";
import { District } from "../address-schema";

const districtRevenueSchema = z.object({
	revenue: z.int(),
});

export const getDistrictRevenueSchema = z.object({
	districts: z.record(z.enum(District), districtRevenueSchema),
});

export type DistrictRevenue = z.infer<typeof districtRevenueSchema>;
