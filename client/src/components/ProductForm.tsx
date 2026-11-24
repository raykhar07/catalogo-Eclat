import { useEffect, useState, type FormEvent } from "react";
import type { Category, Product, ProductInput } from "../types";
import { createProduct, updateProduct } from "../services/api";
import {
  calculateDiscount,
  MAX_PROMO_DISCOUNT,
  MIN_PROMO_DISCOUNT,
} from "../utils/promotions";

interface Props {
  categories: Category[];
  initial?: Product | null;
  onSaved: (message: string) => void;
  onCancel?: () => void;
}

const inputClass =
  "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus:border-cobalt focus:outline-none";

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-ink-soft">{hint}</p>}
    </div>
  );
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function ImageUrlPreview({ url }: { url: string }) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    "loading"
  );

  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-line bg-canvas">
      <div className="relative aspect-4/3">
        {status === "loading" && (
          <div className="shimmer absolute inset-0" aria-hidden="true" />
        )}

        {status === "error" ? (
          <div className="flex h-full flex-col items-center justify-center gap-1 px-4 text-center">
            <p className="text-sm font-medium text-danger">
              No se pudo cargar la imagen.
            </p>
            <p className="text-xs leading-relaxed text-ink-soft">
              Comprueba que sea una URL directa a un archivo de imagen.
            </p>
          </div>
        ) : (
          <img
            src={url}
            alt=""
            loading="eager"
            decoding="async"
            referrerPolicy="no-referrer"
            className={`h-full w-full object-contain transition-opacity duration-300 ${
              status === "loaded" ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setStatus("loaded")}
            onError={() => setStatus("error")}
          />
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-line px-3 py-2">
        <p className="text-xs text-ink-soft" aria-live="polite">
          {status === "loaded"
            ? "Vista previa lista."
            : status === "error"
              ? "No se pudo cargar."
              : "Cargando vista previa…"}
        </p>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 text-xs font-medium text-cobalt hover:underline"
        >
          Abrir imagen
        </a>
      </div>
    </div>
  );
}

export default function ProductForm({
  categories,
  initial,
  onSaved,
  onCancel,
}: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [stock, setStock] = useState(initial ? String(initial.stock) : "0");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [previewUrl, setPreviewUrl] = useState(initial?.imageUrl ?? "");
  const [categoryId, setCategoryId] = useState(
    initial ? String(initial.categoryId) : ""
  );
  const [brand, setBrand] = useState(initial?.brand ?? "");
  const [isPromoted, setIsPromoted] = useState(initial?.isPromoted ?? false);
  const [originalPrice, setOriginalPrice] = useState(
    initial?.originalPrice != null ? String(initial.originalPrice) : ""
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (categoryId === "" && categories.length > 0) {
      setCategoryId(String(categories[0].id));
    }
  }, [categories, categoryId]);

  useEffect(() => {
    const timer = setTimeout(() => setPreviewUrl(imageUrl.trim()), 350);
    return () => clearTimeout(timer);
  }, [imageUrl]);

  const numericPrice = Number(price);
  const numericOriginalPrice =
    originalPrice.trim() === "" ? null : Number(originalPrice);
  const promoDiscount =
    isPromoted &&
    numericOriginalPrice !== null &&
    Number.isFinite(numericOriginalPrice)
      ? calculateDiscount(numericPrice, numericOriginalPrice)
      : 0;
  const promoDiscountIsValid =
    promoDiscount >= MIN_PROMO_DISCOUNT && promoDiscount <= MAX_PROMO_DISCOUNT;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (isPromoted) {
      if (
        numericOriginalPrice === null ||
        !Number.isFinite(numericOriginalPrice)
      ) {
        setError("Indica el precio original para activar la promoción.");
        return;
      }

      if (numericOriginalPrice <= numericPrice) {
        setError("El precio original debe ser mayor que el precio actual.");
        return;
      }

      if (!promoDiscountIsValid) {
        setError(
          `El descuento debe estar entre ${MIN_PROMO_DISCOUNT}% y ${MAX_PROMO_DISCOUNT}% (actual: ${promoDiscount}%).`
        );
        return;
      }
    }

    const input: ProductInput = {
      name: name.trim(),
      description: description.trim(),
      price: numericPrice,
      stock: Number(stock),
      imageUrl: imageUrl.trim(),
      categoryId: Number(categoryId),
      brand: brand.trim() || "Sin marca",
      isPromoted,
      originalPrice: isPromoted ? numericOriginalPrice : null,
    };

    setSaving(true);
    try {
      if (initial) {
        await updateProduct(initial.id, input);
        onSaved("Cambios guardados.");
      } else {
        await createProduct(input);
        onSaved("Producto creado.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo guardar el producto."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-line bg-surface p-5"
    >
      <h2 className="font-display text-lg font-semibold text-ink">
        {initial ? "Editar producto" : "Nuevo producto"}
      </h2>
      <p className="mt-1 text-sm text-ink-soft">
        {initial
          ? "Actualiza los datos y guarda los cambios."
          : "Los campos se validan antes de guardar."}
      </p>

      <div className="mt-5 space-y-4">
        <Field label="Nombre" htmlFor="product-name">
          <input
            id="product-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            minLength={2}
            maxLength={100}
            placeholder="Auriculares inalámbricos"
            className={inputClass}
          />
        </Field>

        <Field label="Descripción" htmlFor="product-description">
          <textarea
            id="product-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
            minLength={10}
            maxLength={2000}
            rows={4}
            placeholder="Qué incluye, para quién es y por qué vale la pena."
            className={`${inputClass} resize-y`}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Precio" htmlFor="product-price">
            <input
              id="product-price"
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              required
              placeholder="0.00"
              className={inputClass}
            />
          </Field>

          <Field label="Stock" htmlFor="product-stock">
            <input
              id="product-stock"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={stock}
              onChange={(event) => setStock(event.target.value)}
              required
              className={inputClass}
            />
          </Field>
        </div>

        <Field
          label="Imagen"
          htmlFor="product-image"
          hint="URL directa a una imagen cuadrada o apaisada."
        >
          <input
            id="product-image"
            type="url"
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            required
            placeholder="https://ejemplo.com/imagen.jpg"
            className={inputClass}
          />

          {previewUrl ? (
            isHttpUrl(previewUrl) ? (
              <ImageUrlPreview key={previewUrl} url={previewUrl} />
            ) : (
              <p className="mt-2 rounded-md border border-line bg-canvas px-3 py-2 text-xs text-ink-soft">
                La URL debe empezar por http:// o https://.
              </p>
            )
          ) : (
            <p className="mt-2 rounded-md border border-dashed border-line bg-canvas px-3 py-2 text-xs text-ink-soft">
              Pega una URL para ver la vista previa.
            </p>
          )}
        </Field>

        <Field label="Categoría" htmlFor="product-category">
          <select
            id="product-category"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            required
            disabled={categories.length === 0}
            className={inputClass}
          >
            {categories.length === 0 && (
              <option value="">Crea una categoría primero</option>
            )}
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Marca"
          htmlFor="product-brand"
          hint="Déjalo vacío para usar «Sin marca»."
        >
          <input
            id="product-brand"
            value={brand}
            onChange={(event) => setBrand(event.target.value)}
            maxLength={80}
            placeholder="Nike"
            className={inputClass}
          />
        </Field>

        <div className="rounded-lg border border-line bg-line/10 p-4">
          <label
            htmlFor="product-promoted"
            className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-ink"
          >
            <input
              id="product-promoted"
              type="checkbox"
              checked={isPromoted}
              onChange={(event) => setIsPromoted(event.target.checked)}
              className="size-4 accent-cobalt"
            />
            En promoción
          </label>
          <p className="mt-1 text-xs text-ink-soft">
            El descuento debe estar entre {MIN_PROMO_DISCOUNT}% y{" "}
            {MAX_PROMO_DISCOUNT}%.
          </p>

          {isPromoted && (
            <div className="animate-fade-in-down animate-duration-200 mt-3">
              <Field label="Precio original" htmlFor="product-original-price">
                <input
                  id="product-original-price"
                  type="number"
                  inputMode="decimal"
                  min="0.01"
                  step="0.01"
                  value={originalPrice}
                  onChange={(event) => setOriginalPrice(event.target.value)}
                  required
                  placeholder="0.00"
                  className={inputClass}
                />
              </Field>
              <p
                className={`mt-2 text-xs font-medium ${
                  promoDiscountIsValid ? "text-success" : "text-danger"
                }`}
              >
                {numericOriginalPrice !== null &&
                Number.isFinite(numericOriginalPrice) &&
                numericOriginalPrice > numericPrice
                  ? `Descuento: ${promoDiscount}%`
                  : "Indica un precio original mayor que el precio actual."}
              </p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <p
          key={error}
          role="alert"
          className="animate-shake mt-4 rounded-md border border-danger/30 bg-danger/5 p-3 text-sm leading-relaxed text-danger"
        >
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={saving || categories.length === 0}
          aria-busy={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-cobalt px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cobalt-deep disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving && (
            <span
              aria-hidden="true"
              className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none"
            />
          )}
          {saving
            ? "Guardando…"
            : initial
              ? "Guardar cambios"
              : "Crear producto"}
        </button>

        {initial && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink-soft disabled:opacity-50"
          >
            Cancelar edición
          </button>
        )}
      </div>
    </form>
  );
}
