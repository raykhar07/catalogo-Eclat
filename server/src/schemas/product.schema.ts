import { z } from "zod";

export const createProductSchema = z.object({
  name: z
    .string({ required_error: "El nombre es obligatorio" })
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede superar los 100 caracteres"),
  description: z
    .string({ required_error: "La descripción es obligatoria" })
    .trim()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(2000, "La descripción no puede superar los 2000 caracteres"),
  price: z.coerce
    .number({ invalid_type_error: "El precio debe ser un número" })
    .positive("El precio debe ser mayor que 0"),
  stock: z.coerce
    .number({ invalid_type_error: "El stock debe ser un número" })
    .int("El stock debe ser un número entero")
    .min(0, "El stock no puede ser negativo"),
  imageUrl: z
    .string({ required_error: "La URL de la imagen es obligatoria" })
    .url("La imagen debe ser una URL válida"),
  categoryId: z.coerce
    .number({ invalid_type_error: "La categoría es obligatoria" })
    .int()
    .positive(),
  originalPrice: z
    .preprocess(
      (value) =>
        value === "" || value === null || value === undefined ? null : value,
      z.coerce
        .number({ invalid_type_error: "El precio original debe ser un número" })
        .positive("El precio original debe ser mayor que 0")
        .nullable()
    )
    .optional(),
  isPromoted: z
    .boolean({ invalid_type_error: "isPromoted debe ser booleano" })
    .optional(),
  brand: z
    .string({ invalid_type_error: "La marca debe ser texto" })
    .trim()
    .max(80, "La marca no puede superar los 80 caracteres")
    .optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const listProductsQuerySchema = z.object({
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  brand: z.string().trim().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z.enum(["newest", "price_asc", "price_desc", "name_asc"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(9),
});
