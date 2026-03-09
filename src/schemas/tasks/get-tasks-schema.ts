import { z } from "zod";
import { queryParamsSchema } from "../query-params-schema";
import { TaskPriority, TaskStatus } from "./task-schema";

export const getTasksSchema = queryParamsSchema
	.extend({
		status: z.enum(TaskStatus),
		priority: z.enum(TaskPriority),
	})
	.partial();

export type GetTasksQuery = z.infer<typeof getTasksSchema>;
