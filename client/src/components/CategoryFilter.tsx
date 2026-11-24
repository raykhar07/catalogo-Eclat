import { useId } from "react";
import type { Category } from "../types";
import { categoryColor } from "../utils/format";

interface Props {
  categories: Category[];
  active: string;
  onChange: (slug: string) => void;
}

export default function CategoryFilter({ categories, active, onChange }: Props) {
  const id = useId();
  const total = categories.reduce(
    (sum, category) => sum + (category._count?.products ?? 0),
    0
  );

  return (
    <fieldset>
      <legend className="text-sm font-medium text-ink">Categorías</legend>
      <ul aria-labelledby={id} className="mt-2 space-y-0.5">
        <li>
          <button
            type="button"
            onClick={() => onChange("")}
            aria-pressed={active === ""}
            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
              active === ""
                ? "bg-cobalt-soft font-medium text-cobalt-deep"
                : "text-ink-soft hover:bg-white hover:text-ink"
            }`}
          >
            <span aria-hidden="true" className="size-2 rounded-xs bg-ink-soft" />
            <span className="flex-1">Todas</span>
            <span className="tnum text-xs text-ink-soft">{total}</span>
          </button>
        </li>
        {categories.map((category) => (
          <li key={category.id}>
            <button
              type="button"
              onClick={() => onChange(category.slug)}
              aria-pressed={active === category.slug}
              className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                active === category.slug
                  ? "bg-cobalt-soft font-medium text-cobalt-deep"
                  : "text-ink-soft hover:bg-white hover:text-ink"
              }`}
            >
              <span
                aria-hidden="true"
                className="size-2 rounded-xs"
                style={{ backgroundColor: categoryColor(category.slug) }}
              />
              <span className="flex-1">{category.name}</span>
              <span className="tnum text-xs text-ink-soft">
                {category._count?.products ?? 0}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </fieldset>
  );
}
