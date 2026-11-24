import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PriceWithDiscount from "../components/PriceWithDiscount";
import ProductImage from "../components/ProductImage";
import PromoBadge from "../components/PromoBadge";
import { getAllProducts } from "../services/api";
import type { Product } from "../types";
import {
  getDiscountPercentage,
  isOnSale,
  matchesProductName,
} from "../utils/promotions";

type SortOption = "discount_desc" | "price_asc" | "price_desc";

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: "discount_desc", label: "Mayor descuento" },
  { value: "price_asc", label: "Menor precio" },
  { value: "price_desc", label: "Mayor precio" },
];

const buttonBase =
  "rounded-full px-4 py-2 text-sm transition-all duration-300 hover:-translate-y-0.5";
const buttonActive =
  "bg-linear-to-r from-cobalt to-cobalt-deep text-white shadow-[0_20px_50px_-30px_var(--accent-glow)]";
const buttonIdle =
  "border border-(--border) text-(--text-secondary) hover:text-(--text-primary)";

export default function Promociones() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>("discount_desc");
  const [query, setQuery] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    getAllProducts({}, controller.signal)
      .then((all) => {
        if (controller.signal.aborted) return;
        setProducts(all.filter(isOnSale));
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        if (err instanceof Error && err.name === "AbortError") return;
        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar las promociones."
        );
        setProducts([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [reloadKey]);

  const visibleProducts = useMemo(() => {
    const enriched = products.map((product) => ({
      product,
      discount: getDiscountPercentage(product),
    }));

    const filtered = query.trim()
      ? enriched.filter(({ product }) => matchesProductName(product, query))
      : enriched;

    return filtered.sort((a, b) => {
      if (sort === "price_asc") return a.product.price - b.product.price;
      if (sort === "price_desc") return b.product.price - a.product.price;
      return (
        b.discount - a.discount ||
        a.product.price - b.product.price ||
        a.product.name.localeCompare(b.product.name)
      );
    });
  }, [products, sort, query]);

  const hasQuery = query.trim().length > 0;
  const shouldAnimate =
    !loading && products.length > 0 && !hasAnimated.current;
  const countLabel = `${visibleProducts.length} ${
    visibleProducts.length === 1 ? "producto" : "productos"
  } con descuento`;

  useEffect(() => {
    if (!loading && products.length > 0) {
      hasAnimated.current = true;
    }
  }, [loading, products.length]);

  return (
    <div className="mx-auto max-w-11/12 px-4 pb-16 pt-10 sm:px-6">
      <section className="relative overflow-hidden rounded-[2.5rem] border border-(--border) bg-(image:--surface) px-6 py-10 shadow-(--card-shadow) sm:px-10 lg:px-14">
        <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(96,165,250,0.18),transparent)] blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.16),transparent)] blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="animate-fade-in-up max-w-2xl">
            <p className="text-xs uppercase tracking-[0.6em] text-(--accent)">
              Ofertas sin adjetivos
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-(--text-primary) sm:text-5xl lg:text-6xl">
              Precios tachados, no promesas.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-(--text-secondary)">
              Productos con descuento activo. Ordena por mayor ahorro o precio;
              el descuento ya está calculado, tú decides si vale la pena.
            </p>
          </div>

          <div className="animate-fade-in-up animate-delay-100 flex w-full flex-col gap-3 lg:w-auto lg:items-end">
            <div className="flex flex-wrap items-center gap-2">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSort(option.value)}
                  aria-pressed={sort === option.value}
                  className={`${buttonBase} ${
                    sort === option.value ? buttonActive : buttonIdle
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--text-secondary)"
              >
                <circle
                  cx="9"
                  cy="9"
                  r="5.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <path
                  d="m13.5 13.5 3 3"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar promoción..."
                aria-label="Buscar promociones por nombre"
                className="w-full rounded-full border border-(--border) bg-transparent py-2 pl-9 pr-9 text-sm text-(--text-primary) placeholder:text-(--text-secondary) focus:border-(--accent) focus:outline-none [&::-webkit-search-cancel-button]:hidden"
              />
              {hasQuery && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-(--text-secondary) transition-colors hover:text-(--text-primary)"
                >
                  <svg viewBox="0 0 20 20" className="h-3.5 w-3.5">
                    <path
                      d="M5 5l10 10M15 5 5 15"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10">
        {loading ? (
          <div className="animate-fade-in animate-duration-200 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="shimmer h-80 rounded-[1.8rem] border border-(--border)"
              />
            ))}
          </div>
        ) : error ? (
          <div className="animate-fade-in mx-auto max-w-md overflow-hidden rounded-[1.9rem] border border-(--border) bg-(image:--surface) p-8 text-center shadow-(--card-shadow)">
            <p className="text-sm uppercase tracking-[0.4em] text-danger">
              Algo salió mal
            </p>
            <h2 className="mt-4 font-display text-2xl font-semibold text-(--text-primary)">
              No se pudieron cargar las promociones
            </h2>
            <p className="mt-3 text-sm text-(--text-secondary)">{error}</p>
            <button
              type="button"
              onClick={() => setReloadKey((value) => value + 1)}
              className="mt-6 inline-flex items-center justify-center rounded-full bg-linear-to-r from-cobalt to-cobalt-deep px-6 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_30px_70px_-28px_var(--accent-glow)]"
            >
              Reintentar
            </button>
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="animate-fade-in mx-auto max-w-md overflow-hidden rounded-[1.9rem] border border-(--border) bg-(image:--surface) p-8 text-center shadow-(--card-shadow)">
            <p className="text-sm uppercase tracking-[0.4em] text-(--accent)">
              Sin promociones
            </p>
            <h2 className="mt-4 font-display text-2xl font-semibold text-(--text-primary)">
              {hasQuery
                ? "Nada tachado con ese nombre"
                : "Hoy no hay nada tachado"}
            </h2>
            <p className="mt-3 text-sm text-(--text-secondary)">
              {hasQuery
                ? `No encontramos promociones para «${query.trim()}».`
                : "Vuelve al catálogo para ver todos los productos disponibles."}
            </p>
            {hasQuery ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="mt-6 inline-flex items-center justify-center rounded-full bg-linear-to-r from-cobalt to-cobalt-deep px-6 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_30px_70px_-28px_var(--accent-glow)]"
              >
                Limpiar búsqueda
              </button>
            ) : (
              <Link
                to="/"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-linear-to-r from-cobalt to-cobalt-deep px-6 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_30px_70px_-28px_var(--accent-glow)]"
              >
                Ir al catálogo
              </Link>
            )}
          </div>
        ) : (
          <>
            <p
              className="mb-5 text-sm text-(--text-secondary)"
              aria-live="polite"
            >
              {countLabel}
              {hasQuery ? ` para «${query.trim()}»` : ""}
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleProducts.map(({ product }, index) => (
                <div
                  key={product.id}
                  className={shouldAnimate ? "animate-fade-in-up" : undefined}
                  style={
                    shouldAnimate
                      ? { animationDelay: `${Math.min(index, 8) * 45}ms` }
                      : undefined
                  }
                >
                  <article
                    className="group relative h-full overflow-hidden rounded-[1.8rem] border border-(--border) bg-(image:--surface) shadow-(--card-shadow) transition-all duration-500 hover:-translate-y-2 hover:shadow-(--card-shadow-hover)"
                  >
                    <PromoBadge product={product} />
                    <Link
                      to={`/product/${product.id}`}
                      className="relative block aspect-4/5 overflow-hidden"
                    >
                      <ProductImage
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
                      />
                    </Link>
                    <div className="flex flex-col gap-3 p-5">
                      <div>
                        <p className="text-xs uppercase tracking-[0.4em] text-(--text-secondary)">
                          {product.category.name}
                        </p>
                        <Link
                          to={`/product/${product.id}`}
                          className="mt-2 block font-display text-lg font-semibold text-(--text-primary) transition-colors duration-300 group-hover:text-(--accent)"
                        >
                          {product.name}
                        </Link>
                        {product.brand && product.brand !== "Sin marca" && (
                          <p className="mt-1 text-xs uppercase tracking-[0.4em] text-(--text-secondary)">
                            {product.brand}
                          </p>
                        )}
                      </div>
                      <PriceWithDiscount product={product} />
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
