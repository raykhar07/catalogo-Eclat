const priceFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function formatPrice(value: number): string {
  return priceFormatter.format(value);
}

export interface StockInfo {
  label: string;
  color: string;
}

/** Etiqueta y color según la disponibilidad. */
export function stockInfo(stock: number): StockInfo {
  if (stock === 0) {
    return { label: "Agotado", color: "#b42318" };
  }
  if (stock <= 5) {
    return { label: `Quedan ${stock}`, color: "#b54708" };
  }
  return { label: "Disponible", color: "#0f766e" };
}

/**
 * Colores de las etiquetas de categoría. Son datos, no decoración:
 * el color identifica la categoría en listas, tarjetas y tablas.
 */
const CATEGORY_COLORS: Record<string, string> = {
  electronica: "#1d4ed8",
  hogar: "#0e7490",
  deportes: "#0891b2",
  moda: "#4f46e5",
  libros: "#64748b",
};

const FALLBACK_COLORS = Object.values(CATEGORY_COLORS);

export function categoryColor(slug: string): string {
  if (CATEGORY_COLORS[slug]) {
    return CATEGORY_COLORS[slug];
  }

  let hash = 0;
  for (const char of slug) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return FALLBACK_COLORS[hash % FALLBACK_COLORS.length];
}

/** Convierte "Electrónica y Más" en "electronica-y-mas". */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Imagen de respaldo si la URL del producto falla. */
export const FALLBACK_IMAGE = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
    <rect width="600" height="450" fill="#e3eafd"/>
    <g fill="none" stroke="#1e4fd8" stroke-width="6" opacity="0.5">
      <rect x="230" y="175" width="140" height="105" rx="8"/>
      <path d="M230 205h140M265 175v-16h70v16"/>
    </g>
  </svg>`
)}`;
