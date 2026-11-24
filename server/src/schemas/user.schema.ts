import { z } from "zod";

export const userIdParamSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "El id debe ser numérico")
    .transform((value) => Number(value)),
});

export const createUserSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(72),
  role: z.enum(["user", "admin"]).default("user"),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).max(72).optional(),
  role: z.enum(["user", "admin"]).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>;
