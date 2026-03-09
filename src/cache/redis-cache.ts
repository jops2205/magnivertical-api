import { Redis } from "ioredis";
import { env } from "../env";
import { minutes } from "../utils/funcs/milliseconds";

type SetOptions = {
	json?: true;
	expiresIn?: number;
};

type GetOptions = {
	json?: true;
};

class RedisCache {
	private readonly redis: Redis;

	constructor(url: string) {
		this.redis = new Redis(url);
	}

	async set<T = string>(
		key: string,
		value: T,
		opts?: SetOptions,
	): Promise<void> {
		const expiresIn = opts?.expiresIn ?? minutes(5);

		await this.redis.set(
			key,
			opts?.json ? JSON.stringify(value) : String(value),
			"PX",
			expiresIn,
		);
	}

	async get<T = string>(key: string, opts?: GetOptions): Promise<T | null> {
		const value = await this.redis.get(key);

		return value ? ((opts?.json ? JSON.parse(value) : value) as T) : null;
	}

	async delete(key: string): Promise<void> {
		await this.redis.del(key);
	}
}

const host = env.get("REDIS_HOST");
const port = env.get("REDIS_PORT");
const database = env.get("REDIS_DB");
const password = env.get("REDIS_PASS");

const url = `redis://:${password}@${host}:${port}/${database}`;

export const cache = new RedisCache(url);
