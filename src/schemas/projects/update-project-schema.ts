import type { z } from "zod";
import { createProjectSchema } from "./create-project-schema";

export const updateProjectSchema = createProjectSchema.omit({
	customerId: true,
});

export type UpdateProjectData = z.infer<typeof updateProjectSchema>;
