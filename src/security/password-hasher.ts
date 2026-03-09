import { compare, hash } from "bcryptjs";

class PasswordHasher {
	constructor(private readonly saltOrRounds: number) {}

	hash(password: string): Promise<string> {
		return hash(password, this.saltOrRounds);
	}

	compare(password: string, hash: string): Promise<boolean> {
		return compare(password, hash);
	}
}

export const hasher = new PasswordHasher(12);
