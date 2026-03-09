import { randomUUID } from "node:crypto";
import { jwtVerify, SignJWT } from "jose";
import { env } from "@/env";
import { minutes } from "@/utils/funcs/milliseconds";

type Payload = Record<string, unknown>;

type EncodeOptions = {
	expiresIn: number;
};

class JwtEncoder {
	private readonly secret: Uint8Array;

	constructor(secret: string) {
		this.secret = new TextEncoder().encode(secret);
	}

	encode<T extends Payload>(payload: T, opts?: EncodeOptions): Promise<string> {
		const expiresIn = opts?.expiresIn ?? minutes(5);

		const seconds = Math.floor(expiresIn / 1000).toString();

		return new SignJWT(payload)
			.setProtectedHeader({ alg: "HS256" })
			.setJti(randomUUID())
			.setExpirationTime(`${seconds}secs`)
			.sign(this.secret);
	}

	async decode<T extends Payload>(token: string): Promise<T | null> {
		try {
			const { payload } = await jwtVerify<T>(token, this.secret);

			return payload;
		} catch {
			return null;
		}
	}
}

export const encoder = new JwtEncoder(env.get("JWT_SECRET"));
