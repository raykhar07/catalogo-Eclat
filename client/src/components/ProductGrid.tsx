import { useEffect, useRef } from "react";
import type { Product } from "../types";
import ProductCard from "./ProductCard";

interface Props {
  products: Product[];
  loading: boolean;
  onClearFilters?: () => void;
}

function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-(--border) bg-(image:--surface) shadow-(--card-shadow)">
      <div className="shimmer aspect-4/3" />
      <div className="flex flex-col gap-3 p-5">
        <div className="shimmer h-5 w-24 rounded-full" />
        <div className="shimmer h-4 w-full rounded" />
        <div className="shimmer h-4 w-2/3 rounded" />
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="shimmer h-6 w-28 rounded" />
          <div className="shimmer h-6 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function ProductGrid({ products, loading, onClearFilters }: Props) {
  const hasAnimated = useRef(false);
  const shouldAnimate = !loading && products.length > 0 && !hasAnimated.current;

  useEffect(() => {
    if (!loading && products.length > 0) {
      hasAnimated.current = true;
    }
  }, [loading, products.length]);

  if (loading) {
    return (
      <div
        className="animate-fade-in animate-duration-200 mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
        aria-busy="true"
        aria-label="Cargando productos"
      >
        {Array.from({ length: 6 }, (_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="animate-fade-in mt-6 flex flex-col items-center justify-center gap-3 rounded-[1.75rem] border border-(--border) bg-(image:--surface) px-6 py-14 text-center shadow-(--card-shadow)">
        <p className="font-display text-xl font-semibold text-(--text-primary)">
          No hay productos con esos filtros
        </p>
        <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-(--text-secondary)">
          Prueba con otro rango de precio, otra categoría o una búsqueda distinta.
        </p>
        {onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="mt-5 inline-flex items-center justify-center rounded-full bg-linear-to-r from-cobalt to-cobalt-deep px-6 py-2.5 text-sm font-medium text-white shadow-[0_25px_60px_-30px_var(--accent-glow)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_30px_70px_-28px_var(--accent-glow)]"
          >
            Quitar filtros
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product, index) => (
        <div
          key={product.id}
          className={shouldAnimate ? "animate-fade-in-up" : undefined}
          style={
            shouldAnimate
              ? { animationDelay: `${Math.min(index, 8) * 45}ms` }
              : undefined
          }
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
