import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type {
  Category,
  Product,
  ProductListResponse,
  ProductSort,
} from "../types";
import { getCategories, getProducts } from "../services/api";
import { formatPrice } from "../utils/format";
import CategoryFilter from "../components/CategoryFilter";
import CategoryTag from "../components/CategoryTag";
import Pagination from "../components/Pagination";
import PriceRange from "../components/PriceRange";
import ProductGrid from "../components/ProductGrid";
import ProductImage from "../components/ProductImage";
import SearchBar from "../components/SearchBar";
import SortSelect from "../components/SortSelect";

const PAGE_SIZE = 9;

export default function Home() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") ?? "";
  const initialBrand = searchParams.get("brand") ?? "";

  const [searchInput, setSearchInput] = useState("");
  const [minInput, setMinInput] = useState("");
  const [maxInput, setMaxInput] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [brand, setBrand] = useState(initialBrand);
  const [sort, setSort] = useState<ProductSort>("newest");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [debounced, setDebounced] = useState({ search: "", min: "", max: "" });

  const [categories, setCategories] = useState<Category[]>([]);
  const [data, setData] = useState<ProductListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [featured, setFeatured] = useState<Product | null>(null);
  const [featuredLoaded, setFeaturedLoaded] = useState(false);

  // Espera a que el usuario termine de escribir antes de consultar.
  useEffect(() => {
    const timer = setTimeout(() => {
      const search = searchInput.trim();
      setDebounced((previous) =>
        previous.search === search &&
        previous.min === minInput &&
        previous.max === maxInput
          ? previous
          : { search, min: minInput, max: maxInput }
      );
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput, minInput, maxInput]);

  // Categorías y producto destacado (solo una vez al entrar).
  useEffect(() => {
    let active = true;

    getCategories()
      .then((result) => {
        if (active) setCategories(result);
      })
      .catch(() => {
        /* Los filtros de categoría no están disponibles, el catálogo sí. */
      });

    getProducts({ sort: "newest", limit: 1 })
      .then((result) => {
        if (!active) return;
        setFeatured(result.products[0] ?? null);
        setFeaturedLoaded(true);
      })
      .catch(() => {
        if (active) setFeaturedLoaded(true);
      });

    return () => {
      active = false;
    };
  }, []);

  // Catálogo según filtros y página.
  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    setLoading(true);
    setError(null);

    getProducts(
      {
        search: debounced.search,
        category,
        brand,
        minPrice: debounced.min,
        maxPrice: debounced.max,
        sort,
        page,
        limit: PAGE_SIZE,
      },
      controller.signal
    )
      .then((response) => {
        if (active) setData(response);
      })
      .catch((err: unknown) => {
        if (!active) return;
        if (err instanceof Error && err.name === "AbortError") return;
        setError(
          err instanceof Error ? err.message : "No se pudo cargar el catálogo."
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [debounced, category, brand, sort, page, reloadKey]);

  const activeCategory = categories.find((item) => item.slug === category);
  const catalogTotal = data?.total ?? 0;
  const totalProducts = categories.reduce(
    (sum, item) => sum + (item._count?.products ?? 0),
    0
  );

  const activeFilterCount = [
    searchInput.trim() !== "",
    category !== "",
    brand !== "",
    minInput !== "",
    maxInput !== "",
    sort !== "newest",
  ].filter(Boolean).length;

  const hasFilters = activeFilterCount > 0;

  function clearFilters() {
    setSearchInput("");
    setMinInput("");
    setMaxInput("");
    setCategory("");
    setBrand("");
    setSort("newest");
    setPage(1);
    setDebounced({ search: "", min: "", max: "" });
  }

  return (
    <>
      <section className="mx-auto max-w-11/12 px-4 pt-10 sm:px-6 lg:pt-14">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <h1 className="animate-fade-in-up max-w-2xl font-display text-4xl font-bold leading-[1.02] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Producto, precio y stock. Lo demás lo pones tú.
            </h1>
            <p className="animate-fade-in-up animate-delay-100 mt-4 max-w-lg text-lg leading-relaxed text-ink-soft">
              Electrónica, hogar, deportes, moda y libros. Filtra por categoría, precio o nombre y deja que el catálogo haga su trabajo.
            </p>
            {categories.length > 0 && (
              <p className="animate-fade-in-up animate-delay-200 mt-5 text-sm text-ink-soft">
                <strong className="tnum font-semibold text-ink">
                  {totalProducts}
                </strong>{" "}
                productos en{" "}
                <strong className="tnum font-semibold text-ink">
                  {categories.length}
                </strong>{" "}
                categorías.
              </p>
            )}
          </div>

          <aside className="animate-fade-in-up animate-delay-200 rounded-xl border border-line bg-surface p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-medium text-ink-soft">
                Recién llegado
              </h2>
              {featured && <CategoryTag category={featured.category} />}
            </div>

            {!featuredLoaded ? (
              <div className="shimmer mt-3 aspect-16/10 rounded-lg" />
            ) : featured ? (
              <Link to={`/product/${featured.id}`} className="group mt-3 block animate-fade-in">
                <div className="aspect-16/10 overflow-hidden rounded-lg bg-cobalt-soft/60">
                  <ProductImage
                    src={featured.imageUrl}
                    alt={featured.name}
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transform-none motion-reduce:transition-none"
                  />
                </div>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="line-clamp-1 font-display text-lg font-semibold leading-snug text-ink">
                      {featured.name}
                    </h3>
                    <p className="tnum mt-0.5 text-sm font-medium text-ink-soft">
                      {formatPrice(featured.price)}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-medium text-cobalt group-hover:underline">
                    Ver producto
                  </span>
                </div>
              </Link>
            ) : (
              <p className="mt-3 rounded-lg bg-canvas px-3 py-6 text-center text-sm text-ink-soft">
                Añade un producto desde Administración para verlo aquí.
              </p>
            )}
          </aside>
        </div>
      </section>

      <div className="mx-auto max-w-11/12 px-4 pb-20 pt-10 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="rounded-xl border border-line bg-surface p-4 lg:sticky lg:top-24 lg:self-start lg:border-0 lg:bg-transparent lg:p-0">
            <SearchBar value={searchInput} onChange={setSearchInput} />

            <button
              type="button"
              onClick={() => setFiltersOpen((open) => !open)}
              aria-expanded={filtersOpen}
              aria-controls="filters-panel"
              className="mt-4 flex w-full items-center justify-between rounded-lg border border-line px-3 py-2 text-sm font-medium text-ink lg:hidden"
            >
              <span>
                Filtros
                {activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
              </span>
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className={`size-4 transition-transform motion-reduce:transition-none ${
                  filtersOpen ? "rotate-180" : ""
                }`}
              >
                <path d="M4 6l4 4 4-4" strokeLinecap="round" />
              </svg>
            </button>

            <div
              id="filters-panel"
              className={`${
                filtersOpen ? "mt-4 space-y-5" : "hidden"
              } lg:mt-5 lg:block lg:space-y-5`}
            >
              <CategoryFilter
                categories={categories}
                active={category}
                onChange={(slug) => {
                  setCategory(slug);
                  setPage(1);
                }}
              />

              <PriceRange
                min={minInput}
                max={maxInput}
                onChangeMin={setMinInput}
                onChangeMax={setMaxInput}
              />

              <SortSelect
                value={sort}
                onChange={(value) => {
                  setSort(value);
                  setPage(1);
                }}
              />

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm font-medium text-cobalt hover:text-cobalt-deep hover:underline"
                >
                  Quitar filtros
                </button>
              )}
            </div>
          </aside>

          <section aria-label="Catálogo de productos">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
              <div>
                <h2 className="font-display text-2xl font-semibold text-ink">
                  Catálogo
                </h2>
                <p aria-live="polite" className="mt-1 text-sm text-ink-soft">
                  {loading
                    ? "Buscando productos…"
                    : error
                      ? "No se pudieron cargar los productos."
                      : `${catalogTotal} ${
                          catalogTotal === 1 ? "producto" : "productos"
                        }${
                          activeCategory ? ` en ${activeCategory.name}` : ""
                        }${brand ? ` de ${brand}` : ""}`}
                </p>
              </div>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="hidden text-sm font-medium text-cobalt hover:text-cobalt-deep hover:underline lg:inline"
                >
                  Quitar filtros
                </button>
              )}
            </div>

            {error ? (
              <div className="mt-6 rounded-xl border border-danger/30 bg-surface p-6">
                <p className="text-sm leading-relaxed text-ink">{error}</p>
                <button
                  type="button"
                  onClick={() => setReloadKey((key) => key + 1)}
                  className="mt-4 rounded-lg bg-cobalt px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cobalt-deep"
                >
                  Reintentar
                </button>
              </div>
            ) : (
              <>
                <ProductGrid
                  products={data?.products ?? []}
                  loading={loading}
                  onClearFilters={hasFilters ? clearFilters : undefined}
                />
                <Pagination
                  page={data?.page ?? 1}
                  totalPages={data?.totalPages ?? 1}
                  onChange={setPage}
                />
              </>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
