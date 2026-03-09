import { z } from "zod";

export enum District {
	ACORES = "ACORES",
	AVEIRO = "AVEIRO",
	BEJA = "BEJA",
	BRAGA = "BRAGA",
	BRAGANCA = "BRAGANCA",
	CASTELO_BRANCO = "CASTELO_BRANCO",
	COIMBRA = "COIMBRA",
	EVORA = "EVORA",
	FARO = "FARO",
	GUARDA = "GUARDA",
	LEIRIA = "LEIRIA",
	LISBOA = "LISBOA",
	MADEIRA = "MADEIRA",
	PORTALEGRE = "PORTALEGRE",
	PORTO = "PORTO",
	SANTAREM = "SANTAREM",
	SETUBAL = "SETUBAL",
	VIANA_DO_CASTELO = "VIANA_DO_CASTELO",
	VILA_REAL = "VILA_REAL",
	VISEU = "VISEU",
}

export const addressPostalCodeRegex: RegExp = /^\d{4}-\d{3}$/;

export const addressSchema = z.object({
	street: z.string().min(1),
	postalCode: z.string().regex(addressPostalCodeRegex),
	complement: z.string().nullable(),
	district: z.enum(District),
});

export type Address = z.infer<typeof addressSchema>;
