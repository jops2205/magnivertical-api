import { z } from "zod";

export const tokenParamSchema = z.object({
	token: z.jwt(),
});
