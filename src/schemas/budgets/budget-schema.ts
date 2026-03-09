import { z } from "zod";

export enum BudgetStatus {
	DRAFT = "DRAFT",
	SENT = "SENT",
	UNDER_REVIEW = "UNDER_REVIEW",
	NOT_REQUESTED = "NOT_REQUESTED",
	REQUESTED = "REQUESTED",
	IN_PRODUCTION = "IN_PRODUCTION",
	PENDING_COMPLETION = "PENDING_COMPLETION",
	COMPLETED = "COMPLETED",
}

export enum BudgetItemType {
	ALUMINUM = "ALUMINUM",
	IRON = "IRON",
	GLASS = "GLASS",
	INOX = "INOX",
	COMPOSITE = "COMPOSITE",
	SHEET = "SHEET",
}

export const budgetItemSchema = z.object({
	id: z.uuid(),
	name: z.string().min(1),
	price: z.int(),
	quantity: z.int(),
	type: z.enum(BudgetItemType),
});

export const budgetSchema = z.object({
	id: z.uuid(),
	name: z.string().min(1),
	status: z.enum(BudgetStatus),
	percentageDiscount: z.int(),
	attachmentsUrl: z.url(),
	createdAt: z.date(),
	userId: z.uuid().nullable(),
	projectId: z.uuid(),
	items: z.array(budgetItemSchema).min(1),
});

export type Budget = z.infer<typeof budgetSchema>;
export type BudgetItem = z.infer<typeof budgetItemSchema>;
