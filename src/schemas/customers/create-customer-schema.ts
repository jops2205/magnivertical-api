import type { z } from "zod";
import { customerSchema } from "./customer-schema";

export const createCustomerSchema = customerSchema.omit({
	id: true,
	createdAt: true,
});

export type CreateCustomerData = z.infer<typeof createCustomerSchema>;
