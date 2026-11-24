import type { Product } from "../types";
import { getDiscountPercentage, isOnSale } from "../utils/promotions";

type PromoBadgeProps = {
  product: Product;
  variant?: "floating" | "inline";
  showDiscount?: boolean;
};

export default function PromoBadge({
  product,
  variant = "floating",
  showDiscount = false,
}: PromoBadgeProps) {
  if (!isOnSale(product)) return null;

  const label = showDiscount
    ? `En promoción · -${getDiscountPercentage(product)}%`
    : "En promoción";

  if (variant === "inline") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-(--accent)/40 bg-(--accent-soft) px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-(--accent)">
        {label}
      </span>
    );
  }

  return (
    <span className="absolute left-4 top-4 z-10 inline-flex items-center rounded-full border border-white/30 bg-white/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.4em] text-(--text-primary) backdrop-blur">
      {label}
    </span>
  );
}
