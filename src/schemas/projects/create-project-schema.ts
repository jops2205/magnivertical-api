import { z } from "zod";
import { addressSchema } from "../address-schema";

export const createProjectSchema = z.object({
	name: z.string().min(1),
	customerId: z.uuid(),
	address: addressSchema,
});

export type CreateProjectData = z.infer<typeof createProjectSchema>;
