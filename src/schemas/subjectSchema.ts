import { string, isoDate, maxLength, pipe, object, regex, minLength } from "valibot";

export const subjectSchema = object({
    uuid: pipe(string(), regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)),
    created_at: pipe(string(), isoDate()),
    name: pipe(string(), maxLength(150)),
    description: pipe(string(), minLength(200))
})

export const createSubjectSchema = object({
    name: pipe(string(), maxLength(150)),
    description: pipe(string(), minLength(200))
})

export const updateSubjectSchea = object({
    name: pipe(string(), maxLength(150)),
    description: pipe(string(), minLength(200))
})