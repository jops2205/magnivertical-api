import { z } from "zod";
import { getTasksSchema } from "./get-tasks-schema";

export const getAssignmentsSchema = getTasksSchema
	.extend({
		executor: z.uuid(),
	})
	.partial();

export type GetAssignmentsQuery = z.infer<typeof getAssignmentsSchema>;
