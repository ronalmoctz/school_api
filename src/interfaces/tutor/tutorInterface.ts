import type { InferInput, InferOutput } from "valibot";
import { tutorSchema, createTutorSchema, updateTutorSchema } from "@/schemas/tutor/tutorSchema";

export type Tutor = InferOutput<typeof tutorSchema>
export type CreateTutor = InferInput<typeof createTutorSchema>
export type UpdateTutor = InferInput<typeof updateTutorSchema>