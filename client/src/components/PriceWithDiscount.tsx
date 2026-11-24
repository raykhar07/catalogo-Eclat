import type { Product } from "../types";
import { formatPrice } from "../utils/format";
import { getDiscountPercentage, isOnSale } from "../utils/promotions";

export default function PriceWithDiscount({ product }: { product: Product }) {
  const discount = getDiscountPercentage(product);

  if (!isOnSale(product)) {
    return (
      <span className="tnum text-sm font-medium text-(--text-primary)">
        {formatPrice(product.price)}
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="tnum text-sm text-(--text-secondary) line-through">
        {formatPrice(Number(product.originalPrice))}
      </span>
      <span className="tnum text-sm font-semibold text-(--accent)">
        {formatPrice(product.price)}
      </span>
      <span className="rounded-full border border-(--accent)/40 px-2 py-0.5 text-[10px] uppercase tracking-[0.3em] text-(--accent)">
        -{discount}%
      </span>
    </div>
  );
}
