import type { InferInput, InferOutput } from "valibot";
import { userSchema, createUserSchema, updateUserSchema } from "@/schemas/userSchema";


export type User = InferOutput<typeof userSchema>;
export type CreateUser = InferInput<typeof createUserSchema>;
export type UpdateUser = InferInput<typeof updateUserSchema>;