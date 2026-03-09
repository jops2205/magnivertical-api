import type { z } from "zod";
import { createTaskSchema } from "./create-task-schema";

export const updateTaskSchema = createTaskSchema;

export type UpdateTaskData = z.infer<typeof updateTaskSchema>;
