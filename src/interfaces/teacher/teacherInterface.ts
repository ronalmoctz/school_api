import type { InferInput, InferOutput } from "valibot";
import { teacherSchema, createTeacherSchema, updateTeacherSchema } from "@/schemas/teacher/teacherSchema";

export type Teacher = InferOutput<typeof teacherSchema>
export type CreateTeacher = InferInput<typeof createTeacherSchema>
export type UpdateTeacher = InferInput<typeof updateTeacherSchema>

