import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }
  try {
    const stored = localStorage.getItem("estante-theme");
    if (stored === "dark" || stored === "light") {
      return stored;
    }
  } catch (e) {
    /* ignore */
  }
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  try {
    localStorage.setItem("estante-theme", theme);
  } catch (e) {
    /* ignore */
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggle = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      data-theme-toggle
      onClick={toggle}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      className="group relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/12 text-(--nav-text) shadow-[0_16px_40px_-24px_rgba(255,255,255,0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/18 hover:shadow-[0_22px_50px_-24px_rgba(255,255,255,0.95)] focus-visible:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 active:translate-y-0 active:scale-[0.96] motion-reduce:transform-none dark:border-white/12 dark:bg-white/8"
    >
      <span className="absolute inset-0 rounded-full bg-linear-to-br from-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className={`relative h-4 w-4 transition-transform duration-500 ${isDark ? "rotate-180 scale-110" : "rotate-0 scale-100"}`}
      >
        {isDark ? (
          <path
            d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364-1.414 1.414M7.05 16.95l-1.414 1.414m12.728 0-1.414-1.414M7.05 7.05 5.636 5.636M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </button>
  );
}
