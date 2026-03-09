import { z } from "zod";
import { addressSchema } from "../address-schema";

export enum CustomerType {
	BUSINESS = "BUSINESS",
	INDIVIDUAL = "INDIVIDUAL",
}

export const customerTaxpayerRegex: RegExp = /^\d{3} \d{3} \d{3}$/;
export const customerPhoneRegex: RegExp = /^\d{3} \d{3} \d{3}$/;

export const customerSchema = z.object({
	id: z.uuid(),
	name: z.string().min(1),
	email: z.email(),
	taxpayer: z.string().regex(customerTaxpayerRegex),
	phone: z.string().regex(customerPhoneRegex),
	type: z.enum(CustomerType),
	address: addressSchema,
	createdAt: z.date(),
});

export type Customer = z.infer<typeof customerSchema>;
