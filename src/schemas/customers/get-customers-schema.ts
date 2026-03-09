import { z } from "zod";
import { queryParamsSchema } from "../query-params-schema";
import { CustomerType } from "./customer-schema";

export const getCustomersSchema = queryParamsSchema
	.extend({
		type: z.enum(CustomerType),
	})
	.partial();

export type GetCustomersQuery = z.infer<typeof getCustomersSchema>;
