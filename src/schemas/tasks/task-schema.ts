import { z } from "zod";

export enum TaskStatus {
	PENDING = "PENDING",
	IN_PROGRESS = "IN_PROGRESS",
	DONE = "DONE",
	CANCELED = "CANCELED",
}

export enum TaskPriority {
	HIGH = "HIGH",
	MEDIUM = "MEDIUM",
	LOW = "LOW",
}

export const taskSchema = z.object({
	id: z.uuid(),
	title: z.string().min(1),
	description: z.string().min(1),
	status: z.enum(TaskStatus),
	priority: z.enum(TaskPriority),
	scheduledAt: z.date(),
	startedAt: z.date().nullable(),
	completedAt: z.date().nullable(),
	createdAt: z.date(),
	creatorId: z.uuid(),
	executorId: z.uuid().nullable(),
});

export type Task = z.infer<typeof taskSchema>;
