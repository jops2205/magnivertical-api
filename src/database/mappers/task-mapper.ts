import type { Task as RawTask } from "@/database/generated/client";
import {
	type Task,
	TaskPriority,
	TaskStatus,
} from "@/schemas/tasks/task-schema";

export const taskMapper = (task: RawTask): Task => {
	return {
		id: task.id,
		title: task.title,
		description: task.description,
		status: TaskStatus[task.status],
		priority: TaskPriority[task.priority],
		scheduledAt: task.scheduledAt,
		startedAt: task.startedAt,
		completedAt: task.completedAt,
		createdAt: task.createdAt,
		creatorId: task.creatorId,
		executorId: task.executorId,
	};
};
