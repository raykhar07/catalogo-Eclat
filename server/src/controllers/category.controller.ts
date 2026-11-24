import { Request, Response } from "express";
import { ApiError } from "../middlewares/errorHandler";
import { parseId } from "../utils/ids";
import { prisma } from "../utils/prisma";

/** GET /api/categories */
export async function getCategories(_req: Request, res: Response) {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  res.json(categories);
}

/** POST /api/categories */
export async function createCategory(req: Request, res: Response) {
  const category = await prisma.category.create({ data: req.body });
  res.status(201).json(category);
}

/** PUT /api/categories/:id */
export async function updateCategory(req: Request, res: Response) {
  const id = parseId(req.params.id);
  const category = await prisma.category.update({
    where: { id },
    data: req.body,
  });
  res.json(category);
}

/** DELETE /api/categories/:id */
export async function deleteCategory(req: Request, res: Response) {
  const id = parseId(req.params.id);

  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });

  if (!category) {
    throw new ApiError(404, "Categoría no encontrada.");
  }

  if (category._count.products > 0) {
    throw new ApiError(
      400,
      `No se puede eliminar "${category.name}": tiene ${category._count.products} producto(s) asociado(s). Mueve o elimina esos productos primero.`
    );
  }

  await prisma.category.delete({ where: { id } });

  res.json({ message: "Categoría eliminada correctamente.", id });
}
