import { pipe, string, regex, isoDate, object, maxLength } from 'valibot'

export const gradeSchema = object({
    uuid: pipe(string(), regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)),
    created_at: pipe(string(), isoDate()),
    grade: pipe(string(), maxLength(20))
})

export const createGradeSchema = object({
    grade: pipe(string(), maxLength(20))
})

export const updateGradeSchema = object({
    grade: pipe(string(), maxLength(20))
})