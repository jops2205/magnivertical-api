import { z } from "zod";

export enum NotificationType {
	TASK = "TASK",
	FOLLOW_UP = "FOLLOW_UP",
}

export const notificationSchema = z.object({
	id: z.uuid(),
	title: z.string().min(1),
	description: z.string().min(1),
	type: z.enum(NotificationType),
	read: z.boolean(),
	createdAt: z.date(),
	userId: z.uuid(),
	taskId: z.uuid().nullable(),
	followUpId: z.uuid().nullable(),
});

export type Notification = z.infer<typeof notificationSchema>;
