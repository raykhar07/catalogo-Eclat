interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

function buildPageWindow(page: number, totalPages: number): Array<number | "gap"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...pages]
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);

  const result: Array<number | "gap"> = [];
  let previous = 0;

  for (const value of sorted) {
    if (value - previous > 1) result.push("gap");
    result.push(value);
    previous = value;
  }

  return result;
}

export default function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;

  const pages = buildPageWindow(page, totalPages);

  return (
    <nav
      aria-label="Paginación del catálogo"
      className="mt-8 flex flex-wrap items-center justify-center gap-1.5"
    >
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-cobalt disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Página anterior"
      >
        Anterior
      </button>

      {pages.map((value, index) =>
        value === "gap" ? (
          <span
            key={`gap-${index}`}
            aria-hidden="true"
            className="px-1.5 text-sm text-ink-soft"
          >
            …
          </span>
        ) : (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            aria-current={value === page ? "page" : undefined}
            aria-label={`Página ${value}`}
            className={`tnum min-w-9 rounded-lg border px-2.5 py-2 text-sm font-medium transition-colors ${
              value === page
                ? "border-cobalt bg-cobalt text-white"
                : "border-line bg-surface text-ink hover:border-cobalt"
            }`}
          >
            {value}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-cobalt disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Página siguiente"
      >
        Siguiente
      </button>
    </nav>
  );
}
