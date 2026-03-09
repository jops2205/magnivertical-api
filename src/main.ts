import { fastifyCookie } from "@fastify/cookie";
import { fastifyCors } from "@fastify/cors";
import { fastifySwagger } from "@fastify/swagger";
import fastifyApiReference from "@scalar/fastify-api-reference";
import { fastify } from "fastify";
import {
	jsonSchemaTransform,
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { env } from "./env";
import { errorHandler } from "./error-handler";
import { cron } from "./jobs/cron-job";
import { createFollowUpNotification } from "./jobs/funcs/create-follow-up-notification";
import { createTaskNotification } from "./jobs/funcs/create-task-notification";
import { CronTime } from "./utils/enums/cron-time";
import { seconds } from "./utils/funcs/milliseconds";
import { rateLimit } from "./web/plugins/rate-limit";
import { router } from "./web/router";

const app = fastify({
	logger:
		env.get("NODE_ENV") === "prod"
			? true
			: {
					transport: {
						target: "pino-pretty",
					},
				},
	maxParamLength: 2048,
}).withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.setErrorHandler(errorHandler);

app.register(fastifyCors, {
	origin: env.get("CORS_ORIGIN"),
	credentials: true,
	methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
});

app.register(fastifyCookie);

app.register(fastifySwagger, {
	transform: jsonSchemaTransform,
	openapi: {
		info: {
			title: "Magnivertical",
			version: "1.0.0",
		},
	},
});

app.register(fastifyApiReference, { routePrefix: "/docs" });

app.register(
	rateLimit({
		expiresIn: seconds(60),
		requestLimit: 60,
	}),
);

app.register(router);

cron.schedule({
	cronTime: CronTime.EVERY_MINUTE,
	onTick: createFollowUpNotification,
});

cron.schedule({
	cronTime: CronTime.EVERY_MINUTE,
	onTick: createTaskNotification,
});

cron.mount();

app.listen(
	{
		port: env.get("PORT"),
		host: "0.0.0.0",
	},
	(error) => {
		if (error) {
			app.log.error(error);
			process.exit(1);
		}
	},
);
