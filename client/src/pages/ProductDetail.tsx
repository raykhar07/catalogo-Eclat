import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { Product } from "../types";
import { getProduct } from "../services/api";
import { formatPrice } from "../utils/format";
import CategoryTag from "../components/CategoryTag";
import ProductImage from "../components/ProductImage";
import Spinner from "../components/Spinner";
import StockBadge from "../components/StockBadge";
import { useCart } from "../context/CartContext";

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;

    setLoading(true);
    setError(null);

    getProduct(id)
      .then((result) => {
        if (active) setProduct(result);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(
          err instanceof Error ? err.message : "No se pudo cargar el producto."
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return <Spinner label="Cargando producto…" />;
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="animate-fade-in mx-auto max-w-md rounded-2xl border border-(--border) bg-(image:--surface) p-6 text-center shadow-(--card-shadow)">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-(--text-primary)">
            No encontramos ese producto
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-(--text-secondary)">
            {error ?? "Puede que se haya eliminado del catálogo."}
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-linear-to-r from-cobalt to-cobalt-deep px-6 py-2.5 text-sm font-medium text-white shadow-[0_25px_60px_-30px_var(--accent-glow)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_30px_70px_-28px_var(--accent-glow)]"
          >
            Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }

  const hasOriginalPrice =
    typeof product.originalPrice === "number" &&
    product.originalPrice > product.price;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      <nav aria-label="Ruta de navegación" className="animate-fade-in text-sm text-(--text-secondary)">
        <Link to="/" className="transition-colors hover:text-(--text-primary)">
          Catálogo
        </Link>
        <span className="mx-1.5" aria-hidden="true">
          /
        </span>
        <Link
          to={`/?category=${encodeURIComponent(product.category.slug)}`}
          className="transition-colors hover:text-(--text-primary)"
        >
          {product.category.name}
        </Link>
        <span className="mx-1.5" aria-hidden="true">
          /
        </span>
        <span className="text-(--text-primary)">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-12">
        <div className="animate-fade-in animate-duration-500 relative overflow-hidden rounded-[1.75rem] border border-(--border) bg-(image:--surface) shadow-(--card-shadow)">
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/40 to-transparent dark:via-white/10" />
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            loading="eager"
            fetchPriority="high"
            className="aspect-4/5 w-full object-cover sm:aspect-4/3 lg:aspect-4/5"
          />
        </div>

        <div className="animate-fade-in-up animate-delay-100 flex flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryTag category={product.category} />
            {product.brand && product.brand !== "Sin marca" && (
              <span className="inline-flex items-center rounded-full border border-(--border) px-2.5 py-1 text-xs font-medium text-(--text-secondary)">
                {product.brand}
              </span>
            )}
            {product.isPromoted && (
              <span className="inline-flex items-center rounded-full bg-linear-to-r from-cobalt/90 to-cobalt-deep px-2.5 py-1 text-xs font-medium text-white shadow-[0_18px_40px_-24px_var(--accent-glow)]">
                En promoción
              </span>
            )}
          </div>

          <h1 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight text-(--text-primary) sm:text-4xl lg:text-5xl">
            {product.name}
          </h1>

          <div className="mt-5 flex flex-wrap items-end gap-x-4 gap-y-2">
            <div className="flex items-baseline gap-3">
              <p className="tnum text-4xl font-semibold tracking-tight text-(--text-primary) sm:text-5xl">
                {formatPrice(product.price)}
              </p>
              {hasOriginalPrice && (
                <p className="tnum text-lg text-(--text-secondary) line-through">
                  {formatPrice(product.originalPrice!)}
                </p>
              )}
            </div>
            <StockBadge stock={product.stock} className="mb-1 text-sm" />
          </div>

          <section className="mt-8">
            <header className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold tracking-tight text-(--text-primary)">
                Descripción
              </h2>
              <span className="text-xs uppercase tracking-[0.32em] text-(--text-secondary)">
                Detalles
              </span>
            </header>
            <div className="mt-4 rounded-2xl border border-(--border) bg-(image:--surface) p-6 shadow-(--card-shadow) sm:p-8">
              <p className="max-w-prose whitespace-pre-line text-base leading-relaxed text-(--text-secondary)">
                {product.description}
              </p>
            </div>
          </section>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            {product.stock > 0 ? (
              <>
                <button
                  type="button"
                  onClick={() => addItem(product, 1)}
                  className="group inline-flex items-center justify-center gap-2 rounded-full border border-(--border) px-7 py-3 text-sm font-medium text-(--text-primary) transition-all duration-300 hover:-translate-y-0.5 hover:bg-(--accent-soft)"
                >
                  <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="size-4">
                    <path
                      d="M3.5 4.5h1.25l1.7 8.5a1 1 0 0 0 .98.75h7.14a1 1 0 0 0 .97-.76l1.16-5.24H6.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="9" cy="16" r="1" />
                    <circle cx="14" cy="16" r="1" />
                  </svg>
                  Añadir al carrito
                </button>
                <Link
                  to={`/checkout/${product.id}`}
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-cobalt to-cobalt-deep px-8 py-3 text-sm font-medium text-white shadow-[0_30px_70px_-30px_var(--accent-glow)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_35px_80px_-28px_var(--accent-glow)] focus-visible:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    className="size-4"
                  >
                    <path
                      d="M3.5 4.5h1.25l1.7 8.5a1 1 0 0 0 .98.75h7.14a1 1 0 0 0 .97-.76l1.16-5.24H6.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="9" cy="16" r="1" />
                    <circle cx="14" cy="16" r="1" />
                  </svg>
                  Comprar ahora
                </Link>
              </>
            ) : (
              <div className="inline-flex items-center justify-center gap-2 rounded-full border border-(--border) px-8 py-3 text-sm font-medium text-(--text-secondary)">
                Sin stock
              </div>
            )}
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-(--border) px-6 py-2.5 text-sm font-medium text-(--text-primary) transition-all duration-300 hover:-translate-y-0.5 hover:bg-(--accent-soft) hover:text-(--text-primary) active:translate-y-0 active:scale-[0.98]"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="size-4"
              >
                <path
                  d="M13 8H3M7 4L3 8l4 4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Volver al catálogo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
