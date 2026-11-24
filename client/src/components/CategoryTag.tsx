import type { Category } from "../types";
import { categoryColor } from "../utils/format";

/** Etiqueta de categoría: el color identifica la categoría en todo el sitio. */
export default function CategoryTag({ category }: { category: Category }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-soft">
      <span
        aria-hidden="true"
        className="size-2 rounded-xs"
        style={{ backgroundColor: categoryColor(category.slug) }}
      />
      {category.name}
    </span>
  );
}
