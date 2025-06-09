import { object, string, pipe, maxLength, minLength, email, boolean, picklist, regex, isoDate, } from "valibot";

export const userRoleSchema = picklist([
    'admin',
    'teacher',
    'student',
    'tutor_parent',
] as const)


export const userSchema = object({
    uuid: pipe(string(), regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)),
    user_name: pipe(string(), minLength(8), maxLength(50)),
    password: pipe(string(), minLength(8), maxLength(100)),
    created_at: pipe(string(), isoDate()),
    email: pipe(string(), email(), maxLength(100)),
    is_active: boolean(),
    role: userRoleSchema,
})

export const createUserSchema = object({
    user_name: pipe(string(), minLength(8), maxLength(50), regex(/^[a-zA-Z0-9_]+$/)),
    password: pipe(string(), minLength(8), maxLength(100)),
    email: pipe(string(), email(), maxLength(100)),
    is_active: boolean(),
    role: userRoleSchema,
})

export const updateUserSchema = object({
    user_name: pipe(string(), minLength(8), maxLength(50)),
    password: pipe(string(), minLength(8), maxLength(100)),
    email: pipe(string(), email(), maxLength(100)),
    is_active: boolean(),
    role: userRoleSchema,
})

