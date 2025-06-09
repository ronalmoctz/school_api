import { isoDate, pipe, object, string, regex, maxLength } from 'valibot'

export const periodSchema = object({
    uuid: pipe(string(), regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)),
    created_at: pipe(string(), isoDate()),
    period: pipe(string(), maxLength(50)),
    start_date: pipe(string(), isoDate()),
    end_date: pipe(string(), isoDate()),
})

export const createPeriodSchema = object({
    period: pipe(string(), maxLength(50)),
    start_date: pipe(string(), isoDate()),
    end_date: pipe(string(), isoDate()),
})
export const updatePeriodSchema = object({
    period: pipe(string(), maxLength(50)),
    start_date: pipe(string(), isoDate()),
    end_date: pipe(string(), isoDate()),
})