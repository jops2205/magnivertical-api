import { z } from "zod";

export enum UserRole {
	MANAGER = "MANAGER",
	ASSISTANT = "ASSISTANT",
	OPERATOR = "OPERATOR",
}

export const userSchema = z.object({
	id: z.uuid(),
	name: z.string().min(1),
	email: z.email(),
	verified: z.boolean(),
	password: z.string().min(1),
	role: z.enum(UserRole),
	createdAt: z.union([z.date(), z.iso.datetime()]),
});

export const userWithoutPasswordSchema = userSchema.omit({
	password: true,
});

export type User = z.infer<typeof userSchema>;
export type UserWithoutPassword = z.infer<typeof userWithoutPasswordSchema>;
