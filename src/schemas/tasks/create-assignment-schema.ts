import type { z } from "zod";
import { createTaskSchema } from "./create-task-schema";

export const createAssignmentSchema = createTaskSchema;

export type CreateAssignmentData = z.infer<typeof createAssignmentSchema>;
