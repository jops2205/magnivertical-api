import { z } from "zod";
import { addressSchema } from "../address-schema";

export enum ProjectStatus {
	PLANNED = "PLANNED",
	IN_PROGRESS = "IN_PROGRESS",
	COMPLETED = "COMPLETED",
	CANCELED = "CANCELED",
}

export const projectSchema = z.object({
	id: z.uuid(),
	name: z.string().min(1),
	code: z.string().min(1),
	status: z.enum(ProjectStatus),
	startedAt: z.date(),
	endedAt: z.date().nullable(),
	customerId: z.uuid().nullable(),
	address: addressSchema,
});

export type Project = z.infer<typeof projectSchema>;
