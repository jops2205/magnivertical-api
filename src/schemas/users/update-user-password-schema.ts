import { z } from "zod";

export const updateUserPasswordSchema = z.object({
	oldPassword: z.string().min(1),
	newPassword: z.string().min(1),
});

export type UpdateUserPasswordData = z.infer<typeof updateUserPasswordSchema>;
