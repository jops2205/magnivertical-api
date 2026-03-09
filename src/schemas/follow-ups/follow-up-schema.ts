import { z } from "zod";

export enum FollowUpStatus {
	PENDING = "PENDING",
	COMPLETED = "COMPLETED",
	CLOSED = "CLOSED",
}

export const followUpSchema = z.object({
	id: z.uuid(),
	description: z.string().min(1).nullable(),
	status: z.enum(FollowUpStatus),
	resolvedAt: z.date().nullable(),
	scheduledAt: z.date(),
	createdAt: z.date(),
	userId: z.uuid().nullable(),
	budgetId: z.uuid(),
});

export type FollowUp = z.infer<typeof followUpSchema>;
