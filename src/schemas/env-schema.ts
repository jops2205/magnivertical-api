import { z } from "zod";

const portSchema = z.coerce.number<string>().int().min(0).max(65535);

const urlSchema = z.url({
	protocol: /^https?$/,
	hostname: z.regexes.hostname,
});

const redisSchema = z.object({
	REDIS_HOST: z.hostname(),
	REDIS_PORT: portSchema.default(6379),
	REDIS_DB: z.coerce.number<string>().int().min(0).max(15).default(0),
	REDIS_PASS: z.string().min(1),
});

export const envSchema = z
	.object({
		NODE_ENV: z.enum(["dev", "test", "prod"]).default("dev"),
		PORT: portSchema.default(3000),
		DATABASE_URL: z.url({
			protocol: /^postgresql$/,
			hostname: z.regexes.hostname,
		}),
		CORS_ORIGIN: urlSchema,
		JWT_SECRET: z.string().min(32),
		RESEND_API_KEY: z.string().min(1),
		APP_URL: urlSchema,
		REDIRECT_URL: urlSchema,
	})
	.extend({
		...redisSchema.shape,
	});

export type Env = z.infer<typeof envSchema>;
