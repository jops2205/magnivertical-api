import { z } from "zod";
import { FollowUpStatus } from "./follow-up-schema";

export const updateFollowUpSchema = z.object({
	description: z.string().min(1),
	status: z.enum(FollowUpStatus),
	nextSchedule: z.coerce.date().optional(),
});

export type UpdateFollowUpData = z.infer<typeof updateFollowUpSchema>;
