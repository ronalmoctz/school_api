import type { InferOutput, InferInput } from 'valibot'
import { subjectSchema, createSubjectSchema, updateSubjectSchea } from '@/schemas/subjectSchema'

export type Subjcet = InferOutput<typeof subjectSchema>
export type CreateSubject = InferInput<typeof createSubjectSchema>
export type UpdateSubjcet = InferInput<typeof updateSubjectSchea>