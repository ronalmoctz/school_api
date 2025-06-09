import type { InferInput, InferOutput } from "valibot";
import { gradeSchema, createGradeSchema, updateGradeSchema } from "@/schemas/gradeSchema";

export type Grade = InferOutput<typeof gradeSchema>
export type CreateGrade = InferInput<typeof createGradeSchema>
export type UpdateGrade = InferInput<typeof updateGradeSchema>