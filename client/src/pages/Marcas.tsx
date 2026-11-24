import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ProductImage from "../components/ProductImage";
import { getAllProducts } from "../services/api";
import type { Product } from "../types";

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function Marcas() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    let mounted = true;
    getAllProducts()
      .then((list) => {
        if (mounted) setProducts(list);
      })
      .catch(() => {
        if (mounted) setProducts([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const brandableProducts = useMemo(
    () => products.filter((product) => product.category?.slug !== "libros"),
    [products]
  );

  const brands = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const product of brandableProducts) {
      const brand = (product.brand || "").trim() || "Sin marca";
      if (brand === "Sin marca") continue;
      if (!map.has(brand)) map.set(brand, []);
      map.get(brand)!.push(product);
    }
    const list = Array.from(map.entries()).map(([name, items]) => ({ name, items }));
    list.sort((a, b) => a.name.localeCompare(b.name, "es"));
    return list;
  }, [brandableProducts]);

  const filteredBrands = useMemo(() => {
    if (!activeLetter) return brands;
    return brands.filter((brand) => brand.name.toUpperCase().startsWith(activeLetter));
  }, [brands, activeLetter]);

  const productsByLetter = useMemo(() => {
    if (!activeLetter) return [];
    return brandableProducts
      .filter((product) => {
        const brand = (product.brand || "").trim() || "Sin marca";
        return brand !== "Sin marca" && brand.toUpperCase().startsWith(activeLetter);
      });
  }, [brandableProducts, activeLetter]);

  const shouldAnimate =
    !loading && brands.length > 0 && !hasAnimated.current;

  useEffect(() => {
    if (!loading && brands.length > 0) {
      hasAnimated.current = true;
    }
  }, [loading, brands.length]);

  const goToBrand = (brand: string) => {
    navigate(`/?brand=${encodeURIComponent(brand)}`);
  };

  return (
    <div className="mx-auto max-w-11/12 px-4 pb-16 pt-10 sm:px-6">
      <section className="relative overflow-hidden rounded-[2.5rem] border border-(--border) bg-(image:--surface) px-6 py-10 shadow-(--card-shadow) sm:px-10 lg:px-14">
        <div className="absolute -left-16 top-12 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(96,165,250,0.16),transparent)] blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.14),transparent)] blur-3xl" />
        <div className="animate-fade-in-up relative max-w-2xl">
          <p className="text-xs uppercase tracking-[0.6em] text-(--accent)">Directorio de marcas</p>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-(--text-primary) sm:text-5xl lg:text-6xl">
            Marcas con productos, no con biografía.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-(--text-secondary)">
            Elige una inicial y ve qué vende cada marca. Sin perfiles corporativos: solo catálogo.
          </p>
        </div>
      </section>

      <section className="animate-fade-in-up animate-delay-100 mt-8 flex flex-wrap items-center justify-center gap-1 rounded-full border border-(--border) bg-(--surface-subtle) px-3 py-1.5 sm:justify-between sm:px-4">
        <button
          type="button"
          onClick={() => setActiveLetter(null)}
          className={`shrink-0 rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.4em] transition-all duration-300 hover:-translate-y-0.5 ${activeLetter === null ? "bg-linear-to-r from-cobalt to-cobalt-deep text-white shadow-[0_20px_50px_-30px_var(--accent-glow)]" : "text-(--text-secondary) hover:text-(--text-primary)"}`}
        >
          Todas
        </button>
        <div className="flex flex-1 flex-wrap items-center justify-center gap-1 sm:justify-between">
          {letters.map((letter) => {
            const hasBrands = brands.some((brand) => brand.name.toUpperCase().startsWith(letter));
            const isActive = activeLetter === letter;
            return (
              <button
                key={letter}
                type="button"
                onClick={() => {
                  if (!hasBrands) return;
                  setActiveLetter(letter);
                }}
                className={`rounded-full px-2 py-1 text-xs transition-all duration-300 sm:px-1.5 ${isActive ? "bg-linear-to-r from-cobalt to-cobalt-deep text-white shadow-[0_20px_50px_-30px_var(--accent-glow)]" : hasBrands ? "cursor-pointer text-(--text-secondary) hover:-translate-y-0.5 hover:text-(--text-primary)" : "cursor-not-allowed text-(--text-secondary)/40"}`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        {loading ? (
          <div className="animate-fade-in animate-duration-200 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, index) => (
              <div key={index} className="shimmer h-40 rounded-[1.8rem] border border-(--border)" />
            ))}
          </div>
        ) : activeLetter === null ? (
          filteredBrands.length === 0 ? (
            <div className="animate-fade-in mx-auto max-w-md overflow-hidden rounded-[1.9rem] border border-(--border) bg-(image:--surface) p-8 text-center shadow-(--card-shadow)">
              <p className="text-sm uppercase tracking-[0.4em] text-(--accent)">Sin resultados</p>
              <h2 className="mt-4 font-display text-2xl font-semibold text-(--text-primary)">Todavía no hay marcas en el directorio</h2>
              <p className="mt-3 text-sm text-(--text-secondary)">Vuelve al catálogo para ver los productos disponibles.</p>
              <Link to="/" className="mt-6 inline-flex items-center justify-center rounded-full bg-linear-to-r from-cobalt to-cobalt-deep px-6 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_30px_70px_-28px_var(--accent-glow)]">
                Ir al catálogo
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBrands.map((brand, index) => {
                const preview = brand.items.slice(0, 4);
                const initials = brand.name
                  .split(/\s+/)
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join("")
                  .toUpperCase();
                return (
                  <button
                    key={brand.name}
                    type="button"
                    onClick={() => goToBrand(brand.name)}
                    className={`group relative overflow-hidden rounded-[1.9rem] border border-(--border) bg-(image:--surface) p-6 text-left shadow-(--card-shadow) transition-all duration-500 hover:-translate-y-2 hover:shadow-(--card-shadow-hover)${shouldAnimate ? " animate-fade-in" : ""}`}
                    style={
                      shouldAnimate
                        ? { animationDelay: `${Math.min(index, 8) * 45}ms` }
                        : undefined
                    }
                  >
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(96,165,250,0.16),transparent)] blur-3xl transition-opacity duration-500 group-hover:opacity-80" />
                    <div className="relative flex items-center gap-4">
                      <span className="grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-white/10 text-sm font-semibold text-(--text-primary) backdrop-blur">
                        {initials || "EM"}
                      </span>
                      <div>
                        <p className="font-display text-xl font-semibold text-(--text-primary)">{brand.name}</p>
                        <p className="mt-1 text-sm text-(--text-secondary)">{brand.items.length} producto{brand.items.length === 1 ? "" : "s"}</p>
                      </div>
                    </div>
                    <div className="relative mt-6 flex items-center gap-2">
                      {preview.map((item) => (
                        <div key={item.id} className="h-14 w-14 overflow-hidden rounded-2xl border border-white/10">
                          <ProductImage src={item.imageUrl} alt={item.name} />
                        </div>
                      ))}
                      {brand.items.length > 4 && (
                        <span className="grid h-14 w-14 place-items-center rounded-2xl border border-white/10 text-xs text-(--text-secondary)">
                          +{brand.items.length - 4}
                        </span>
                      )}
                    </div>
                    <span className="relative mt-6 inline-flex items-center gap-2 text-sm text-(--accent)">
                      Ver productos
                      <svg viewBox="0 0 20 20" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1">
                        <path d="M7.5 4.5 13 10l-5.5 5.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </button>
                );
              })}
            </div>
          )
        ) : (
          <div key={activeLetter} className="animate-fade-in space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-(--accent)">Marcas con {activeLetter}</p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-(--text-primary) sm:text-3xl">
                  {filteredBrands.length === 0 ? "Sin marcas" : `${filteredBrands.length} marca${filteredBrands.length === 1 ? "" : "s"}`}
                </h2>
              </div>
              <button type="button" onClick={() => setActiveLetter(null)} className="inline-flex items-center justify-center rounded-full border border-(--border) px-5 py-2 text-sm text-(--text-secondary) transition-all duration-300 hover:-translate-y-0.5 hover:text-(--text-primary)">
                Ver todas las marcas
              </button>
            </div>
            {filteredBrands.length === 0 ? (
              <div className="animate-fade-in mx-auto max-w-md overflow-hidden rounded-[1.9rem] border border-(--border) bg-(image:--surface) p-8 text-center shadow-(--card-shadow)">
                <p className="text-sm uppercase tracking-[0.4em] text-(--accent)">Sin resultados</p>
                <h3 className="mt-4 font-display text-2xl font-semibold text-(--text-primary)">No hay marcas con esa letra</h3>
                <button type="button" onClick={() => setActiveLetter(null)} className="mt-6 inline-flex items-center justify-center rounded-full bg-linear-to-r from-cobalt to-cobalt-deep px-6 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_30px_70px_-28px_var(--accent-glow)]">
                  Ver todas las marcas
                </button>
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredBrands.map((brand) => {
                    const preview = brand.items.slice(0, 4);
                    const initials = brand.name
                      .split(/\s+/)
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join("")
                      .toUpperCase();
                    return (
                      <button
                        key={brand.name}
                        type="button"
                        onClick={() => goToBrand(brand.name)}
                        className="group relative overflow-hidden rounded-[1.9rem] border border-(--border) bg-(image:--surface) p-6 text-left shadow-(--card-shadow) transition-all duration-500 hover:-translate-y-2 hover:shadow-(--card-shadow-hover)"
                      >
                        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(96,165,250,0.16),transparent)] blur-3xl transition-opacity duration-500 group-hover:opacity-80" />
                        <div className="relative flex items-center gap-4">
                          <span className="grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-white/10 text-sm font-semibold text-(--text-primary) backdrop-blur">
                            {initials || "EM"}
                          </span>
                          <div>
                            <p className="font-display text-xl font-semibold text-(--text-primary)">{brand.name}</p>
                            <p className="mt-1 text-sm text-(--text-secondary)">{brand.items.length} producto{brand.items.length === 1 ? "" : "s"}</p>
                          </div>
                        </div>
                        <div className="relative mt-6 flex items-center gap-2">
                          {preview.map((item) => (
                            <div key={item.id} className="h-14 w-14 overflow-hidden rounded-2xl border border-white/10">
                              <ProductImage src={item.imageUrl} alt={item.name} />
                            </div>
                          ))}
                          {brand.items.length > 4 && (
                            <span className="grid h-14 w-14 place-items-center rounded-2xl border border-white/10 text-xs text-(--text-secondary)">
                              +{brand.items.length - 4}
                            </span>
                          )}
                        </div>
                        <span className="relative mt-6 inline-flex items-center gap-2 text-sm text-(--accent)">
                          Ver productos
                          <svg viewBox="0 0 20 20" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1">
                            <path d="M7.5 4.5 13 10l-5.5 5.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </button>
                    );
                  })}
                </div>
                {productsByLetter.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-(--text-primary)">Productos destacados con {activeLetter}</p>
                      <Link to={`/?letter=${activeLetter}`} className="text-sm text-(--accent) transition-opacity hover:opacity-80">
                        Ver todo en catálogo
                      </Link>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {productsByLetter.map((product) => (
                        <Link
                          key={product.id}
                          to={`/product/${product.id}`}
                          className="group relative overflow-hidden rounded-[1.8rem] border border-(--border) bg-(image:--surface) shadow-(--card-shadow) transition-all duration-500 hover:-translate-y-2 hover:shadow-(--card-shadow-hover)"
                        >
                          <div className="relative aspect-4/5 overflow-hidden">
                            <ProductImage
                              src={product.imageUrl}
                              alt={product.name}
                              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
                            />
                          </div>
                          <div className="flex flex-col gap-2 p-5">
                            <p className="text-xs uppercase tracking-[0.4em] text-(--text-secondary)">{product.brand}</p>
                            <p className="font-display text-lg font-semibold text-(--text-primary) transition-colors duration-300 group-hover:text-(--accent)">{product.name}</p>
                            <p className="text-sm text-(--text-secondary)">{product.category.name}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
