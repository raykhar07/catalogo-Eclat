import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getCategories } from "../services/api";
import type { Category } from "../types";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

const linkBase =
  "group relative inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-24px_rgba(255,255,255,0.9)] focus-visible:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems, openCart } = useCart();
  const navigate = useNavigate();
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    getCategories()
      .then((data) => {
        if (mounted) {
          setCategories(data);
        }
      })
      .catch(() => {
        if (mounted) {
          setCategories([]);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setCategoriesOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-50">
      <div className="relative mx-auto flex h-17 max-w-full items-center justify-between gap-3 px-4 sm:px-6">
        <div className="absolute inset-x-0 top-0 -z-10 h-full border-b border-white/15 bg-(--nav-bg) backdrop-blur-xl shadow-[0_30px_60px_-40px_rgba(59,130,246,0.9)]" />
        <div className="flex items-center gap-6">
          <Logo />
          <nav aria-label="Navegación principal" className="hidden items-center gap-1 md:flex">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `${linkBase} ${
                  isActive
                    ? "bg-white/18 text-(--nav-text) shadow-[0_12px_30px_-18px_rgba(255,255,255,0.8)]"
                    : "text-(--nav-text-soft) hover:text-(--nav-text) hover:bg-white/10"
                }`
              }
            >
              <span>Explorar</span>
            </NavLink>

            <NavLink
              to="/promociones"
              className={({ isActive }) =>
                `${linkBase} ${
                  isActive
                    ? "bg-white/18 text-(--nav-text)"
                    : "text-(--nav-text-soft) hover:text-(--nav-text) hover:bg-white/10"
                }`
              }
            >
              <span className="relative inline-flex items-center gap-2">
                Promociones
                <span className="relative inline-flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--accent) opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-(--accent)" />
                </span>
              </span>
            </NavLink>

            <NavLink
              to="/marcas"
              className={({ isActive }) =>
                `${linkBase} ${
                  isActive
                    ? "bg-white/18 text-(--nav-text)"
                    : "text-(--nav-text-soft) hover:text-(--nav-text) hover:bg-white/10"
                }`
              }
            >
              <span>Marcas</span>
            </NavLink>

            <div ref={categoriesRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setCategoriesOpen((prev) => !prev);
                  setAccountOpen(false);
                }}
                className={`${linkBase} ${
                  categoriesOpen
                    ? "bg-white/18 text-(--nav-text)"
                    : "text-(--nav-text-soft) hover:text-(--nav-text) hover:bg-white/10"
                }`}
              >
                Categorías
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  className={`h-3.5 w-3.5 transition-transform duration-300 ${categoriesOpen ? "rotate-180" : ""}`}
                >
                  <path
                    d="M5.25 7.5 10 12.25 14.75 7.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {categoriesOpen && (
                <div className="animate-fade-in-down animate-duration-200 absolute left-0 top-full mt-2 w-64 overflow-hidden rounded-2xl border border-white/15 bg-(--nav-bg) text-(--nav-text) shadow-[0_60px_90px_-60px_rgba(59,130,246,0.9)] backdrop-blur-xl">
                  <div className="px-4 py-2.5 text-xs uppercase tracking-[0.32em] text-(--nav-text-soft)">
                    Elige una categoría
                  </div>
                  <div className="max-h-72 overflow-y-auto px-1.5 pb-2">
                    {categories.length === 0 ? (
                      <p className="px-3 py-2 text-sm text-(--nav-text-soft)">
                        Sin categorías disponibles
                      </p>
                    ) : (
                      categories.map((category) => (
                        <NavLink
                          key={category.id}
                          to={`/?category=${encodeURIComponent(category.slug)}`}
                          onClick={() => setCategoriesOpen(false)}
                          className="flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors hover:bg-white/12"
                        >
                          <span>{category.name}</span>
                          <span className="text-xs text-(--nav-text-soft)">Ver</span>
                        </NavLink>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <NavLink
              to="/contacto"
              className={({ isActive }) =>
                `${linkBase} ${
                  isActive
                    ? "bg-white/18 text-(--nav-text)"
                    : "text-(--nav-text-soft) hover:text-(--nav-text) hover:bg-white/10"
                }`
              }
            >
              <span>Contacto</span>
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={openCart}
            className={`${linkBase} relative text-(--nav-text-soft) hover:text-(--nav-text) hover:bg-white/10`}
            aria-label="Abrir carrito"
          >
          <svg xmlns="http://www.w3.org/2000/svg" className="size-6.5" viewBox="0 0 24 24"><path fill="currentColor" d="M11 9V6H8V4h3V1h2v3h3v2h-3v3zM5.588 21.413Q5 20.825 5 20t.588-1.412T7 18t1.413.588T9 20t-.587 1.413T7 22t-1.412-.587m10 0Q15 20.825 15 20t.588-1.412T17 18t1.413.588T19 20t-.587 1.413T17 22t-1.412-.587M1 4V2h3.275l4.25 9h7l3.9-7H21.7l-4.975 9H8.1L7 15h12v2H3.625L6.6 11.6L3 4z"/></svg>
            {totalItems > 0 && (
              <span
                key={totalItems}
                className="animate-pop absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-(--accent) px-1 text-[10px] font-semibold text-white"
              >
                {totalItems}
              </span>
            )}
          </button>
          <div ref={accountRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setAccountOpen((prev) => !prev);
                setCategoriesOpen(false);
              }}
              className={`${linkBase} ${
                accountOpen
                  ? "bg-white/18 text-(--nav-text) shadow-[0_18px_40px_-22px_rgba(255,255,255,0.9)]"
                  : "text-(--nav-text-soft) hover:text-(--nav-text) hover:bg-white/10"
              }`}
              aria-label={isAuthenticated && user ? `Cuenta de ${user.name}` : "Cuenta y sesión"}
            >
              <span className="pointer-events-none absolute inset-0 rounded-full bg-linear-to-r from-white/12 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              {isAuthenticated && user ? (
                <>
                  <span className="relative grid h-7 w-7 place-items-center rounded-full bg-linear-to-br from-white/90 to-white/70 text-xs font-semibold text-(--accent-strong) shadow-[0_12px_30px_-18px_rgba(255,255,255,0.9)]">
                    {getInitials(user.name)}
                  </span>
                  <span className="relative hidden max-w-37.5 truncate sm:inline">{user.name.split(" ")[0]}</span>
                </>
              ) : (
                <>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="relative h-4 w-4"
                  >
                    <circle cx="12" cy="8" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
                    <path
                      d="M5.5 19a6.5 6.5 0 0 1 13 0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="relative hidden sm:inline">Cuenta</span>
                </>
              )}
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                className={`relative hidden h-3.5 w-3.5 transition-transform duration-300 sm:block ${accountOpen ? "rotate-180" : ""}`}
              >
                <path
                  d="M5.25 7.5 10 12.25 14.75 7.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {accountOpen && (
              <div className="animate-fade-in-down animate-duration-200 absolute right-0 top-full mt-2 w-72 overflow-hidden rounded-2xl border border-white/15 bg-(--nav-bg) text-(--nav-text) shadow-[0_60px_90px_-60px_rgba(59,130,246,0.9)] backdrop-blur-xl">
                <div className="px-4 py-2.5 text-xs uppercase tracking-[0.32em] text-(--nav-text-soft)">
                  {isAuthenticated && user ? "Mi cuenta" : "Cuenta"}
                </div>
                <div className="px-1.5 pb-2">
                  {isAuthenticated && user ? (
                    <>
                      <div className="flex items-center gap-3 rounded-xl px-3 py-2">
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-linear-to-br from-white/90 to-white/70 text-sm font-semibold text-(--accent-strong)">
                          {getInitials(user.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{user.name}</p>
                          <p className="truncate text-xs text-(--nav-text-soft)">{user.email}</p>
                        </div>
                      </div>
                      <NavLink
                        to="/mis-pedidos"
                        onClick={() => setAccountOpen(false)}
                        className="mt-1 flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/12 active:translate-y-0 active:scale-[0.99]"
                      >
                        <span>Mis pedidos</span>
                        <span className="text-xs text-(--nav-text-soft)">Historial</span>
                      </NavLink>
                      {user.role === "admin" && (
                        <NavLink
                          to="/admin"
                          onClick={() => setAccountOpen(false)}
                          className="mt-1 flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/12 active:translate-y-0 active:scale-[0.99]"
                        >
                          <span>Panel de administración</span>
                          <span className="text-xs text-(--nav-text-soft)">CRUD</span>
                        </NavLink>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setAccountOpen(false);
                          logout();
                          navigate("/");
                        }}
                        className="mt-1 flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-(--nav-text-soft) transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/12 hover:text-(--nav-text) active:translate-y-0 active:scale-[0.99]"
                      >
                        <span>Cerrar sesión</span>
                        <span className="text-xs">Salir</span>
                      </button>
                    </>
                  ) : (
                    <NavLink
                      to="/auth"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/12 active:translate-y-0 active:scale-[0.99]"
                    >
                      <span>Iniciar sesión / Registrarte</span>
                      <span className="text-xs text-(--nav-text-soft)">Acceder</span>
                    </NavLink>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setAccountOpen(false);
                      const toggle = document.querySelector<HTMLButtonElement>("[data-theme-toggle]");
                      toggle?.click();
                    }}
                    className="mt-1 flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-(--nav-text-soft) transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/12 hover:text-(--nav-text) active:translate-y-0 active:scale-[0.99]"
                  >
                    <span>Ajustes de visualización</span>
                    <span className="text-xs">Cambiar tema</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
