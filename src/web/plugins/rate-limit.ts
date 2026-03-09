import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { fastifyPlugin } from "fastify-plugin";
import { cache } from "@/cache/redis-cache";
import { HttpStatus, type Response } from "@/schemas/response-schema";
import { CacheKeys } from "@/utils/enums/cache-keys";

type RateLimitOptions = {
	expiresIn: number;
	requestLimit: number;
};

export const rateLimit = (opts: RateLimitOptions) => {
	return fastifyPlugin((app: FastifyInstance) => {
		app.addHook(
			"onRequest",
			async (request: FastifyRequest, response: FastifyReply) => {
				const clientIp = request.ip;
				const cacheKey = `${CacheKeys.REQUEST_COUNT}:${clientIp}`;

				const { expiresIn, requestLimit } = opts;

				const cachedRequestCount = await cache.get(cacheKey);

				if (cachedRequestCount) {
					if (+cachedRequestCount > requestLimit) {
						return response.status(HttpStatus.TOO_MANY_REQUESTS).send({
							message: "Too many requests",
							statusCode: HttpStatus.TOO_MANY_REQUESTS,
						} satisfies Response);
					}

					await cache.set(cacheKey, (+cachedRequestCount + 1).toString(), {
						expiresIn,
					});
				} else {
					await cache.set(cacheKey, "1", { expiresIn });
				}
			},
		);
	});
};
