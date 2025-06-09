import { string, isoDate, maxLength, pipe, object, regex, minLength } from "valibot";

export const tutorSchema = object({
    uuid: pipe(string(), regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)),
    created_at: pipe(string(), isoDate()),
    name: pipe(string(), maxLength(150)),
    middle_name: pipe(string(), maxLength(150)),
    last_name: pipe(string(), maxLength(150)),
    phone: pipe(string(), minLength(10), maxLength(10)),
    email: pipe(string(), maxLength(200))
})

export const createTutorSchema = object({
    name: pipe(string(), maxLength(150)),
    middle_name: pipe(string(), maxLength(150)),
    last_name: pipe(string(), maxLength(150)),
    phone: pipe(string(), minLength(10), maxLength(10)),
    email: pipe(string(), maxLength(200))
})

export const updateTutorSchema = object({
    name: pipe(string(), maxLength(150)),
    middle_name: pipe(string(), maxLength(150)),
    last_name: pipe(string(), maxLength(150)),
    phone: pipe(string(), minLength(10), maxLength(10)),
    email: pipe(string(), maxLength(200))
})