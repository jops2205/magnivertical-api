import { db } from "@/database";
import { FollowUpStatus } from "@/schemas/follow-ups/follow-up-schema";
import { NotificationType } from "@/schemas/notifications/notification-schema";
import { hours, minutes } from "@/utils/funcs/milliseconds";

export const createFollowUpNotification = async () => {
	const now = new Date();
	const oneHourLater = new Date(now.getTime() + hours(1));

	const windowStart = new Date(oneHourLater.getTime() - minutes(1));
	const windowEnd = new Date(oneHourLater.getTime() + minutes(1));

	const followUps = await db.followUp.findMany({
		where: {
			status: FollowUpStatus.PENDING,
			scheduledAt: {
				gte: windowStart,
				lt: windowEnd,
			},
		},
		include: {
			budget: {
				include: {
					project: {
						include: { customer: true },
					},
				},
			},
		},
	});

	if (followUps.length === 0) {
		return;
	}

	for (const followUp of followUps) {
		if (!followUp.userId) {
			continue;
		}

		const user = await db.user.findUnique({
			where: {
				id: followUp.userId,
				verified: true,
			},
		});

		if (!user) {
			continue;
		}

		const existingNotification = await db.notification.findUnique({
			where: {
				userId_followUpId: {
					userId: user.id,
					followUpId: followUp.id,
				},
			},
		});

		if (!existingNotification) {
			const name = followUp.budget.project.customer?.name;

			await db.notification.create({
				data: {
					title: `Follow-up Agendado para Hoje: ${now.toLocaleDateString("pt-PT")}`,
					description: `Não te esqueças do follow-up agendado para hoje com ${name}`,
					type: NotificationType.FOLLOW_UP,
					user: {
						connect: { id: user.id },
					},
					followUp: {
						connect: { id: followUp.id },
					},
				},
			});
		}
	}
};
