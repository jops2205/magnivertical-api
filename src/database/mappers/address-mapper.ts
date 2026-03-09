import { type Address, District } from "@/schemas/address-schema";
import type { Address as RawAddress } from "../generated/client";

export const addressMapper = (address: RawAddress): Address => {
	return {
		street: address.street,
		postalCode: address.postalCode,
		complement: address.complement,
		district: District[address.district],
	};
};
