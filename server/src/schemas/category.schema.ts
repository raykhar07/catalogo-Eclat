import { z } from "zod";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const createCategorySchema = z.object({
  name: z
    .string({ required_error: "El nombre es obligatorio" })
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(60, "El nombre no puede superar los 60 caracteres"),
  slug: z
    .string({ required_error: "El slug es obligatorio" })
    .trim()
    .toLowerCase()
    .regex(slugRegex, "El slug solo admite minúsculas, números y guiones"),
});

export const updateCategorySchema = createCategorySchema.partial();
