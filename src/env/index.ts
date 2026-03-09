import { type Env, envSchema } from "../schemas/env-schema";

class EnvService {
	private readonly env: Env;

	constructor(env: Record<string, string | undefined>) {
		this.env = this.parse(env);
	}

	get<T extends keyof Env>(key: T): Env[T] {
		return this.env[key];
	}

	private parse(env: Record<string, string | undefined>): Env {
		const { success, data, error } = envSchema.safeParse(env);

		if (!success) {
			console.error(error);
			process.exit(1);
		}

		return data;
	}
}

export const env = new EnvService(process.env);
