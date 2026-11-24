import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ApiError } from "../middlewares/errorHandler";
import { parseId } from "../utils/ids";
import { prisma } from "../utils/prisma";

interface ProductListQuery {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "name_asc";
  page: number;
  limit: number;
}

const sortMap: Record<string, Prisma.ProductOrderByWithRelationInput> = {
  newest: { createdAt: "desc" },
  price_asc: { price: "asc" },
  price_desc: { price: "desc" },
  name_asc: { name: "asc" },
};

const productInclude = { category: true } as const;

/** Convierte el Decimal de Prisma en number para que el JSON sea simple. */
function serialize(product: any) {
  if (!product) return product;
  const serialized = { ...product };
  if (serialized.price !== null && serialized.price !== undefined) {
    serialized.price = Number(serialized.price);
  }
  if (serialized.originalPrice !== null && serialized.originalPrice !== undefined) {
    serialized.originalPrice = Number(serialized.originalPrice);
  }
  return serialized;
}

/** Convierte el precio original (Decimal, string o null) a number | null. */
function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  return Number(value);
}

/**
 * Un producto marcado como promoción debe tener un precio original mayor que
 * el actual y un descuento real entre 5% y 75%, el mismo rango que usa el
 * frontend en `utils/promotions.ts`.
 */
function assertPromoDiscount(
  price: number,
  originalPrice: number | null,
  isPromoted: boolean
) {
  if (!isPromoted) return;

  if (originalPrice === null || !Number.isFinite(originalPrice)) {
    throw new ApiError(400, "Un producto en promoción necesita un precio original.");
  }

  if (originalPrice <= price) {
    throw new ApiError(
      400,
      "El precio original debe ser mayor que el precio actual."
    );
  }

  const discount = Math.floor(((originalPrice - price) / originalPrice) * 100);
  if (discount < 5 || discount > 75) {
    throw new ApiError(
      400,
      "El descuento de una promoción debe estar entre 5% y 75%."
    );
  }
}

/**
 * GET /api/products
 * Lista paginada con búsqueda, filtro por categoría (id o slug),
 * rango de precios y ordenamiento.
 */
export async function getProducts(req: Request, res: Response) {
  const { search, category, brand, minPrice, maxPrice, sort, page, limit } =
    req.query as unknown as ProductListQuery;

  const where: Prisma.ProductWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }

  if (category) {
    const categoryId = Number(category);
    if (Number.isInteger(categoryId) && categoryId > 0) {
      where.categoryId = categoryId;
    } else {
      where.category = { slug: category };
    }
  }

  if (brand) {
    where.brand = brand;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    const price: Prisma.DecimalFilter = {};
    if (minPrice !== undefined) price.gte = minPrice;
    if (maxPrice !== undefined) price.lte = maxPrice;
    where.price = price;
  }

  const orderBy = sortMap[sort ?? "newest"] ?? sortMap.newest;
  const skip = (page - 1) * limit;

  const [total, products] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: productInclude,
      orderBy,
      skip,
      take: limit,
    }),
  ]);

  res.json({
    products: products.map(serialize),
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  });
}

/** GET /api/products/:id */
export async function getProductById(req: Request, res: Response) {
  const id = parseId(req.params.id);

  const product = await prisma.product.findUnique({
    where: { id },
    include: productInclude,
  });

  if (!product) {
    throw new ApiError(404, "Producto no encontrado.");
  }

  res.json(serialize(product));
}

/** POST /api/products */
export async function createProduct(req: Request, res: Response) {
  const data = req.body;

  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });
  if (!category) {
    throw new ApiError(400, "La categoría indicada no existe.");
  }

  assertPromoDiscount(
    Number(data.price),
    toNumberOrNull(data.originalPrice),
    Boolean(data.isPromoted)
  );

  const product = await prisma.product.create({
    data,
    include: productInclude,
  });

  res.status(201).json(serialize(product));
}

/** PUT /api/products/:id */
export async function updateProduct(req: Request, res: Response) {
  const id = parseId(req.params.id);
  const data = req.body;

  if (data.categoryId !== undefined) {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) {
      throw new ApiError(400, "La categoría indicada no existe.");
    }
  }

  if (
    "price" in data ||
    "originalPrice" in data ||
    "isPromoted" in data
  ) {
    const current = await prisma.product.findUnique({ where: { id } });
    if (!current) {
      throw new ApiError(404, "Producto no encontrado.");
    }

    assertPromoDiscount(
      data.price !== undefined ? Number(data.price) : Number(current.price),
      data.originalPrice !== undefined
        ? toNumberOrNull(data.originalPrice)
        : toNumberOrNull(current.originalPrice),
      data.isPromoted !== undefined
        ? Boolean(data.isPromoted)
        : current.isPromoted
    );
  }

  const product = await prisma.product.update({
    where: { id },
    data,
    include: productInclude,
  });

  res.json(serialize(product));
}

/** DELETE /api/products/:id */
export async function deleteProduct(req: Request, res: Response) {
  const id = parseId(req.params.id);

  await prisma.product.delete({ where: { id } });

  res.json({ message: "Producto eliminado correctamente.", id });
}
