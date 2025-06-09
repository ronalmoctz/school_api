import type { InferInput, InferOutput } from "valibot";
import { studentSchema, createStudentSchema, updateStudentSchema } from "@/schemas/student/studentSchema";
import type { Tutor } from "../tutor/tutorInterface";

export type Student = InferOutput<typeof studentSchema>
export type CreateStudent = InferInput<typeof createStudentSchema>
export type UpdateStudent = InferInput<typeof updateStudentSchema>

export type StudentWithTutor = Student & { tutor: Tutor }