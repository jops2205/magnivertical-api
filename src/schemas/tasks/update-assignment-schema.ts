import { z } from "zod";
import { updateTaskSchema } from "./update-task-schema";

export const updateAssignmentSchema = updateTaskSchema.extend({
	executorId: z.uuid(),
});

export type UpdateAssignmentData = z.infer<typeof updateAssignmentSchema>;
