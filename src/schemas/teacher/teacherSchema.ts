import { string, isoDate, maxLength, pipe, object, regex, minLength } from "valibot";

export const teacherSchema = object({
    uuid: pipe(string(), regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)),
    created_at: pipe(string(), isoDate()),
    name: pipe(string(), maxLength(150)),
    middle_name: pipe(string(), maxLength(150)),
    last_name: pipe(string(), maxLength(150)),
    phone: pipe(string(), minLength(10), maxLength(10)),
    user_fk: pipe(string(), regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)),
    grade_id: pipe(string(), regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)),
    location_id: pipe(string(), regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/))
})

export const createTeacherSchema = object({
    name: pipe(string(), maxLength(150)),
    middle_name: pipe(string(), maxLength(150)),
    last_name: pipe(string(), maxLength(150)),
    phone: pipe(string(), minLength(10), maxLength(10)),
    user_fk: pipe(string(), regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)),
    grade_id: pipe(string(), regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)),
    location_id: pipe(string(), regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/))
})

export const updateTeacherSchema = object({
    name: pipe(string(), maxLength(150)),
    middle_name: pipe(string(), maxLength(150)),
    last_name: pipe(string(), maxLength(150)),
    phone: pipe(string(), minLength(10), maxLength(10)),
    user_fk: pipe(string(), regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)),
    grade_id: pipe(string(), regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)),
    location_id: pipe(string(), regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/))
})