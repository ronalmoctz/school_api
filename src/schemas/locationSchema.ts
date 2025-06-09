import { string, isoDate, maxLength, pipe, object, regex } from "valibot";

export const locationSchema = object({
    uuid: pipe(string(), regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)),
    country: pipe(string(), maxLength(100)),
    state: pipe(string(), maxLength(100)),
    municipality: pipe(string(), maxLength(100)),
    city: pipe(string(), maxLength(100)),
    street: pipe(string(), maxLength(200)),
    colony: pipe(string(), maxLength(100)),
    created_at: pipe(string(), isoDate())
})

export const createLoctionSchema = object({
    country: pipe(string(), maxLength(100)),
    state: pipe(string(), maxLength(100)),
    municipality: pipe(string(), maxLength(100)),
    city: pipe(string(), maxLength(100)),
    street: pipe(string(), maxLength(200)),
    colony: pipe(string(), maxLength(100))
})

export const updateLocationSchema = object({
    country: pipe(string(), maxLength(100)),
    state: pipe(string(), maxLength(100)),
    municipality: pipe(string(), maxLength(100)),
    city: pipe(string(), maxLength(100)),
    street: pipe(string(), maxLength(200)),
    colony: pipe(string(), maxLength(100))
})