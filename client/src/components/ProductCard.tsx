import { Link } from "react-router-dom";
import type { Product } from "../types";
import { formatPrice } from "../utils/format";
import CategoryTag from "./CategoryTag";
import ProductImage from "./ProductImage";
import PromoBadge from "./PromoBadge";
import StockBadge from "./StockBadge";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to={`/product/${product.id}`}
      className="card-sheen group relative flex h-full flex-col overflow-hidden rounded-2xl border border-(--border) bg-(image:--surface) shadow-(--card-shadow) transition-all duration-500 hover:-translate-y-1 hover:border-(--border-strong) hover:shadow-(--card-shadow-hover) focus-visible:-translate-y-1 motion-reduce:transition-none motion-reduce:transform-none"
    >
      <div className="relative aspect-4/3 overflow-hidden">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:transform-none"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-black/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-black/30" />
        <span className="pointer-events-none absolute bottom-3 right-3 translate-y-2 rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium text-(--text-primary) opacity-0 shadow-[0_20px_40px_-30px_rgba(15,23,42,0.9)] backdrop-blur transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 dark:bg-white/10 dark:text-(--text-primary)">
          Ver producto
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <CategoryTag category={product.category} />
        <h3 className="line-clamp-2 font-display text-lg font-semibold leading-snug text-(--text-primary) transition-colors duration-300 group-hover:text-(--accent)">
          {product.name}
        </h3>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <span className="tnum text-xl font-semibold text-(--text-primary)">
            {formatPrice(product.price)}
          </span>
          <div className="flex flex-col items-end gap-1.5">
            <PromoBadge product={product} variant="inline" />
            <StockBadge stock={product.stock} />
          </div>
        </div>
      </div>
    </Link>
  );
}
