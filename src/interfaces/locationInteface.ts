import type { InferInput, InferOutput } from "valibot";
import { locationSchema, updateLocationSchema, createLoctionSchema } from "@/schemas/locationSchema";

export type Location = InferOutput<typeof locationSchema>
export type CreateLocation = InferInput<typeof createLoctionSchema>
export type UpdateLocation = InferInput<typeof updateLocationSchema>