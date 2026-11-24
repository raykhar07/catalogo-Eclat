import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

type ExportProduct = {
  name: string;
  description: string;
  price: number;
  originalPrice: number | null;
  isPromoted: boolean;
  brand: string;
  imageUrl: string;
  stock: number;
  categorySlug: string;
  categoryName: string;
};

const CATEGORY_ORDER = ["electronica", "hogar", "deportes", "moda", "libros"];

async function main() {
  const exportPath = path.resolve(__dirname, "../scripts/products-export.json");
  const raw = fs.readFileSync(exportPath, "utf8");
  const products: ExportProduct[] = JSON.parse(raw);

  if (!Array.isArray(products) || products.length === 0) {
    throw new Error("products-export.json está vacío o inválido");
  }

  console.log("Limpiando datos existentes...");
  await prisma.order.deleteMany();
  await prisma.account.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log("Creando categorías...");
  const categoryMap = new Map<string, number>();
  const seen = new Set<string>();

  for (const slug of CATEGORY_ORDER) {
    const match = products.find((p) => p.categorySlug === slug);
    if (!match || seen.has(slug)) continue;
    const cat = await prisma.category.create({
      data: { name: match.categoryName, slug: match.categorySlug },
    });
    categoryMap.set(slug, cat.id);
    seen.add(slug);
  }

  for (const p of products) {
    if (seen.has(p.categorySlug)) continue;
    const cat = await prisma.category.create({
      data: { name: p.categoryName, slug: p.categorySlug },
    });
    categoryMap.set(p.categorySlug, cat.id);
    seen.add(p.categorySlug);
  }

  console.log(`Insertando ${products.length} productos...`);
  for (const p of products) {
    const categoryId = categoryMap.get(p.categorySlug);
    if (!categoryId) throw new Error(`Categoría no encontrada para slug: ${p.categorySlug}`);

    await prisma.product.create({
      data: {
        name: p.name,
        description: p.description,
        price: p.price,
        originalPrice: p.originalPrice,
        isPromoted: p.isPromoted,
        brand: p.brand,
        imageUrl: p.imageUrl,
        stock: p.stock,
        categoryId,
      },
    });
  }

  console.log(
    `¡Seed completado! ${categoryMap.size} categorías, ${products.length} productos creados.`
  );
}

main()
  .catch((e) => {
    console.error("Error durante el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
