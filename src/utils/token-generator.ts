import type { UserRole } from "@/schemas/users/user-schema";
import { encoder } from "@/security/jwt-encoder";
import { days, minutes } from "./funcs/milliseconds";

export type UserPayload = {
	id: string;
	verified: boolean;
	role: UserRole;
};

export type IdentifierPayload = {
	id: string;
};

class TokenGenerator {
	generateAccessToken = (payload: UserPayload) => {
		return encoder.encode<UserPayload>(
			{
				id: payload.id,
				verified: payload.verified,
				role: payload.role,
			},
			{ expiresIn: minutes(15) },
		);
	};

	generateRefreshToken = (id: string) => {
		return encoder.encode<IdentifierPayload>({ id }, { expiresIn: days(7) });
	};

	generateAuthenticationToken = (id: string) => {
		return encoder.encode<IdentifierPayload>({ id }, { expiresIn: minutes(5) });
	};

	generateVerificationToken = (id: string) => {
		return encoder.encode<IdentifierPayload>(
			{ id },
			{ expiresIn: minutes(10) },
		);
	};
}

export const generator = new TokenGenerator();
