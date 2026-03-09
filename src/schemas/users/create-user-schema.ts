import { z } from "zod";
import { UserRole } from "./user-schema";

export const createUserSchema = z.object({
	name: z.string().min(1),
	email: z.email(),
	role: z.enum(UserRole),
});

export type CreateUserData = z.infer<typeof createUserSchema>;
