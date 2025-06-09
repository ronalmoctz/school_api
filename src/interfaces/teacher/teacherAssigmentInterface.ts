import type { InferInput, InferOutput } from 'valibot'
import { teacherAssigmentSchema, createTeacherAssigment, updateTeacherAssigment } from '@/schemas/teacher/teacherAssigmentSchema'


export type TeacherAssigment = InferOutput<typeof teacherAssigmentSchema>
export type CreateTeacherAssigment = InferInput<typeof createTeacherAssigment>
export type UpdateteacherAssigment = InferInput<typeof updateTeacherAssigment>