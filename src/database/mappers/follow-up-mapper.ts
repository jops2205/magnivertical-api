import type { FollowUp as RawFollowUp } from "@/database/generated/client";
import {
	type FollowUp,
	FollowUpStatus,
} from "@/schemas/follow-ups/follow-up-schema";

export const followUpMapper = (followUp: RawFollowUp): FollowUp => {
	return {
		id: followUp.id,
		description: followUp.description,
		status: FollowUpStatus[followUp.status],
		resolvedAt: followUp.resolvedAt,
		scheduledAt: followUp.scheduledAt,
		createdAt: followUp.createdAt,
		userId: followUp.userId,
		budgetId: followUp.budgetId,
	};
};
