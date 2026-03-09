import type { Notification as RawNotification } from "@/database/generated/client";
import {
	type Notification,
	NotificationType,
} from "@/schemas/notifications/notification-schema";

export const notificationMapper = (
	notification: RawNotification,
): Notification => {
	return {
		id: notification.id,
		title: notification.title,
		description: notification.description,
		type: NotificationType[notification.type],
		read: notification.read,
		createdAt: notification.createdAt,
		userId: notification.userId,
		taskId: notification.taskId,
		followUpId: notification.followUpId,
	};
};
