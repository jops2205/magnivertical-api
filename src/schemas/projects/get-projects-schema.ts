import { z } from "zod";
import { queryParamsSchema } from "../query-params-schema";
import { ProjectStatus } from "./project-schema";

export const getProjectsSchema = queryParamsSchema
	.extend({
		from: z.coerce.date(),
		to: z.coerce.date(),
		status: z.enum(ProjectStatus),
		customer: z.uuid(),
	})
	.partial();

export type GetProjectsQuery = z.infer<typeof getProjectsSchema>;
