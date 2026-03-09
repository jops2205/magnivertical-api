import type { z } from "zod";
import { createCustomerSchema } from "./create-customer-schema";

export const updateCustomerSchema = createCustomerSchema;

export type UpdateCustomerData = z.infer<typeof updateCustomerSchema>;
