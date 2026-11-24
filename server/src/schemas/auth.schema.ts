import { z } from "zod";

const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

export const registerSchema = z.object({
  name: z
    .string({ required_error: "El nombre es obligatorio" })
    .min(1, "El nombre es obligatorio")
    .trim()
    .min(3, "El nombre debe tener al menos 3 letras")
    .max(80, "El nombre no puede superar 80 caracteres")
    .regex(nameRegex, "El nombre solo debe contener letras"),
  email: z
    .string({ required_error: "El correo electrónico es obligatorio" })
    .min(1, "El correo electrónico es obligatorio")
    .trim()
    .toLowerCase()
    .email("Correo electrónico inválido"),
  password: z
    .string({ required_error: "La contraseña es obligatoria" })
    .min(1, "La contraseña es obligatoria")
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(72, "La contraseña no puede superar 72 caracteres"),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: "El correo electrónico es obligatorio" })
    .min(1, "El correo electrónico es obligatorio")
    .trim()
    .toLowerCase()
    .email("Correo electrónico inválido"),
  password: z
    .string({ required_error: "La contraseña es obligatoria" })
    .min(1, "La contraseña es obligatoria"),
});

export const updateProfileSchema = z
  .object({
    name: z.string().min(2).max(80).optional(),
    email: z.string().email().optional(),
    password: z.string().min(8).max(72).optional(),
    currentPassword: z.string().min(1).optional(),
  })
  .refine(
    (data: any) => {
      if (data.password && !data.currentPassword) {
        return false;
      }
      return true;
    },
    { message: "Debes indicar la contraseña actual para cambiarla", path: ["currentPassword"] }
  ) as any;

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
