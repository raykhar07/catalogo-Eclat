import type { Product } from "../types";

/** Rango válido para que un producto cuente como promoción. */
export const MIN_PROMO_DISCOUNT = 5;
export const MAX_PROMO_DISCOUNT = 75;

type ProductPricing = Pick<Product, "price" | "originalPrice">;

/**
 * Porcentaje entero de descuento a partir del precio original.
 * Devuelve 0 si no hay un precio original válido.
 */
export function calculateDiscount(
  price: number,
  originalPrice?: number | null
): number {
  const current = Number(price);
  const original = Number(originalPrice ?? 0);

  if (
    !Number.isFinite(current) ||
    !Number.isFinite(original) ||
    original <= current
  ) {
    return 0;
  }

  return Math.floor(((original - current) / original) * 100);
}

export function getDiscountPercentage(product: ProductPricing): number {
  return calculateDiscount(product.price, product.originalPrice);
}

/**
 * Regla única de "producto en promoción": está marcado con `isPromoted` y
 * tiene un descuento real dentro del rango [5%, 75%]. La usan la card del
 * catálogo, el precio con descuento y la página de promociones para que
 * nunca se contradigan.
 */
export function isOnSale(
  product: ProductPricing & Pick<Product, "isPromoted">
): boolean {
  if (!product.isPromoted) return false;
  const discount = getDiscountPercentage(product);
  return discount >= MIN_PROMO_DISCOUNT && discount <= MAX_PROMO_DISCOUNT;
}

/** Minúsculas y sin diacríticos, para búsquedas tolerantes a tildes. */
export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** Coincidencia parcial por nombre, pensada para buscar mientras se escribe. */
export function matchesProductName(
  product: Pick<Product, "name">,
  query: string
): boolean {
  const needle = normalizeText(query);
  if (!needle) return true;
  return normalizeText(product.name).includes(needle);
}
