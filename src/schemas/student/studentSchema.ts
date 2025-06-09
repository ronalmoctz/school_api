import { string, isoDate, maxLength, pipe, object, regex } from "valibot"

export const studentSchema = object({
    uuid: pipe(string(), regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)),
    created_at: pipe(string(), isoDate()),
    name: pipe(string(), maxLength(150)),
    middle_name: pipe(string(), maxLength(150)),
    last_name: pipe(string(), maxLength(150)),
    tutor_id: pipe(string(), regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/))
})

export const createStudentSchema = object({
    name: pipe(string(), maxLength(150)),
    middle_name: pipe(string(), maxLength(150)),
    last_name: pipe(string(), maxLength(150)),
    tutor_id: pipe(string(), regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/))
})

export const updateStudentSchema = object({
    name: pipe(string(), maxLength(150)),
    middle_name: pipe(string(), maxLength(150)),
    last_name: pipe(string(), maxLength(150)),
    tutor_id: pipe(string(), regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/))
})