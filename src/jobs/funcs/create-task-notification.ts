import { db } from "@/database";
import { NotificationType } from "@/schemas/notifications/notification-schema";
import { TaskStatus } from "@/schemas/tasks/task-schema";
import { hours, minutes } from "@/utils/funcs/milliseconds";

export const createTaskNotification = async () => {
	const now = new Date();
	const oneHourLater = new Date(now.getTime() + hours(1));

	const windowStart = new Date(oneHourLater.getTime() - minutes(1));
	const windowEnd = new Date(oneHourLater.getTime() + minutes(1));

	const users = await db.user.findMany({ where: { verified: true } });

	if (users.length === 0) {
		return;
	}

	const verifiedUserIds = users.map((user) => user.id);

	const tasks = await db.task.findMany({
		where: {
			status: TaskStatus.PENDING,
			executorId: { in: verifiedUserIds },
			scheduledAt: {
				gte: windowStart,
				lt: windowEnd,
			},
		},
	});

	if (tasks.length === 0) {
		return;
	}

	for (const task of tasks) {
		if (!task.executorId) {
			continue;
		}

		const existingNotification = await db.notification.findUnique({
			where: {
				userId_taskId: {
					userId: task.executorId,
					taskId: task.id,
				},
			},
		});

		if (!existingNotification) {
			await db.notification.create({
				data: {
					title: `Tarefa Agendada para Hoje: ${now.toLocaleDateString("pt-PT")}`,
					description: task.title,
					type: NotificationType.TASK,
					user: {
						connect: { id: task.executorId },
					},
					task: {
						connect: { id: task.id },
					},
				},
			});
		}
	}
};
