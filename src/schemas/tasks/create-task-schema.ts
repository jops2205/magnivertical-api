import { z } from "zod";
import { TaskPriority } from "./task-schema";

export const createTaskSchema = z.object({
	title: z.string().min(1),
	description: z.string().min(1),
	priority: z.enum(TaskPriority),
	scheduledAt: z.coerce.date(),
});

export type CreateTaskData = z.infer<typeof createTaskSchema>;
