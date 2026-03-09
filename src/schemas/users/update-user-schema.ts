import type { z } from "zod";
import { createUserSchema } from "./create-user-schema";

export const updateUserSchema = createUserSchema;

export type UpdateUserData = z.infer<typeof updateUserSchema>;
