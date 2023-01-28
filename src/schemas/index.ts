import { z } from "zod";
export const placeholderSchema = z.object({ something: z.string().optional() });
