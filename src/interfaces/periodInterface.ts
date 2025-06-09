import type { InferInput, InferOutput } from "valibot";
import { periodSchema, createPeriodSchema, updatePeriodSchema } from "@/schemas/periodSchema";

export type Period = InferOutput<typeof periodSchema>
export type CreatePeriod = InferInput<typeof createPeriodSchema>
export type UpdatePeriod = InferInput<typeof updatePeriodSchema>