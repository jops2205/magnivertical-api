import {
	type Customer,
	CustomerType,
} from "@/schemas/customers/customer-schema";
import type { Prisma } from "../generated/client";
import { addressMapper } from "./address-mapper";

type RawCustomer = Prisma.CustomerGetPayload<{
	include: {
		address: true;
	};
}>;

export const customerMapper = (customer: RawCustomer): Customer => {
	const { address } = customer;

	return {
		id: customer.id,
		name: customer.name,
		email: customer.email,
		taxpayer: customer.taxpayer,
		phone: customer.phone,
		type: CustomerType[customer.type],
		createdAt: customer.createdAt,
		address: addressMapper(address),
	};
};
