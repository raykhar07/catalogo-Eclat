import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import type { Category, Product } from "../types";
import {
  createCategory,
  deleteCategory,
  deleteProduct,
  getCategories,
  getProducts,
  updateCategory,
} from "../services/api";
import { categoryColor, formatPrice, slugify } from "../utils/format";
import CategoryTag from "../components/CategoryTag";
import ConfirmDialog from "../components/ConfirmDialog";
import ProductForm from "../components/ProductForm";
import ProductImage from "../components/ProductImage";
import Toast, { useToast } from "../components/Toast";

const ADMIN_PAGE_SIZE = 8;

type Tab = "productos" | "categorias";

type ShowToast = (message: string, kind?: "success" | "error") => void;

export default function Admin() {
  const [tab, setTab] = useState<Tab>("productos");
  const [categories, setCategories] = useState<Category[]>([]);
  const { toast, showToast, dismissToast } = useToast();

  const loadCategories = useCallback(async () => {
    try {
      setCategories(await getCategories());
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las categorías.",
        "error"
      );
    }
  }, [showToast]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Administración
          </h1>
          <p className="mt-1 text-ink-soft">
            Gestiona el catálogo y las categorías de la tienda.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Secciones de administración"
          className="inline-flex rounded-lg border border-line bg-surface p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "productos"}
            onClick={() => setTab("productos")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === "productos"
                ? "bg-cobalt text-white"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            Productos
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "categorias"}
            onClick={() => setTab("categorias")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === "categorias"
                ? "bg-cobalt text-white"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            Categorías
          </button>
        </div>
      </header>

      <div
        role="tabpanel"
        key={tab}
        className="animate-fade-in animate-duration-200 mt-8"
      >
        {tab === "productos" ? (
          <ProductsManager
            categories={categories}
            onCategoriesChanged={loadCategories}
            showToast={showToast}
          />
        ) : (
          <CategoriesManager
            categories={categories}
            onChanged={loadCategories}
            showToast={showToast}
          />
        )}
      </div>

      <Toast toast={toast} onClose={dismissToast} />
    </div>
  );
}

interface ProductsManagerProps {
  categories: Category[];
  onCategoriesChanged: () => Promise<void>;
  showToast: ShowToast;
}

function ProductsManager({
  categories,
  onCategoriesChanged,
  showToast,
}: ProductsManagerProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async (targetPage: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getProducts({
        page: targetPage,
        limit: ADMIN_PAGE_SIZE,
        sort: "newest",
      });

      setProducts(response.products);
      setTotal(response.total);
      setTotalPages(response.totalPages);

      if (response.totalPages < targetPage) {
        setPage(response.totalPages);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los productos."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(page);
  }, [load, page]);

  function handleEdit(product: Product) {
    setEditing(product);

    if (formRef.current && typeof formRef.current.scrollIntoView === "function") {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      formRef.current.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    }
  }

  async function handleSaved(message: string) {
    setEditing(null);
    showToast(message);
    await onCategoriesChanged();
    await load(page);
  }

  async function handleDelete() {
    if (!deleting) return;

    setDeletingBusy(true);
    try {
      await deleteProduct(deleting.id);
      showToast("Producto eliminado.");
      if (editing?.id === deleting.id) setEditing(null);
      setDeleting(null);
      await onCategoriesChanged();
      await load(page);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "No se pudo eliminar el producto.",
        "error"
      );
    } finally {
      setDeletingBusy(false);
    }
  }

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <section aria-label="Listado de productos" className="min-w-0">
          <div className="overflow-hidden rounded-xl border border-line bg-surface">
            <div className="overflow-x-auto">
              <table className="w-full min-w-160 text-left text-sm">
                <thead className="border-b border-line text-xs text-ink-soft">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Producto
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Categoría
                    </th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">
                      Precio
                    </th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">
                      Stock
                    </th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <ProductImage
                            src={product.imageUrl}
                            alt=""
                            className="size-10 shrink-0 rounded-md border border-line object-cover"
                          />
                          <div className="min-w-0">
                            <p className="line-clamp-1 font-medium text-ink">
                              {product.name}
                            </p>
                            <p className="mt-0.5 line-clamp-1 text-xs text-ink-soft">
                              {product.brand || "Sin marca"}
                              {product.isPromoted && (
                                <span className="ml-2 font-medium text-cobalt">
                                  En promoción
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <CategoryTag category={product.category} />
                      </td>
                      <td className="tnum px-4 py-3 text-right text-ink">
                        {formatPrice(product.price)}
                      </td>
                      <td className="tnum px-4 py-3 text-right text-ink">
                        {product.stock}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleEdit(product)}
                            className="rounded-md px-2 py-1 text-xs font-medium text-cobalt transition-colors hover:bg-cobalt-soft"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleting(product)}
                            className="rounded-md px-2 py-1 text-xs font-medium text-danger transition-colors hover:bg-danger/5"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!loading && !error && products.length === 0 && (
              <p className="px-4 py-8 text-sm text-ink-soft">
                Aún no hay productos. Crea el primero con el formulario.
              </p>
            )}

            {loading && (
              <p className="flex items-center gap-2 px-4 py-4 text-sm text-ink-soft">
                <span
                  aria-hidden="true"
                  className="size-4 animate-spin rounded-full border-2 border-line border-t-cobalt motion-reduce:animate-none"
                />
                Cargando productos…
              </p>
            )}

            {!loading && error && (
              <p className="px-4 py-4 text-sm text-danger">{error}</p>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-ink-soft">
            <span className="tnum">
              {total} {total === 1 ? "producto" : "productos"}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={page <= 1 || loading}
                className="rounded-lg border border-line bg-surface px-3 py-1.5 font-medium text-ink transition-colors hover:border-cobalt disabled:cursor-not-allowed disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="tnum px-1">
                Página {page} de {totalPages}
              </span>
              <button
                type="button"
                onClick={() =>
                  setPage((value) => Math.min(totalPages, value + 1))
                }
                disabled={page >= totalPages || loading}
                className="rounded-lg border border-line bg-surface px-3 py-1.5 font-medium text-ink transition-colors hover:border-cobalt disabled:cursor-not-allowed disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </div>
        </section>

        <div ref={formRef} className="scroll-mt-24 lg:sticky lg:top-24">
          <ProductForm
            key={editing?.id ?? "new"}
            categories={categories}
            initial={editing}
            onSaved={handleSaved}
            onCancel={() => setEditing(null)}
          />
        </div>
      </div>

      <ConfirmDialog
        open={deleting !== null}
        title="Eliminar producto"
        description={
          deleting
            ? `"${deleting.name}" se quitará del catálogo. Esta acción no se puede deshacer.`
            : ""
        }
        busy={deletingBusy}
        onCancel={() => {
          if (!deletingBusy) setDeleting(null);
        }}
        onConfirm={handleDelete}
      />
    </>
  );
}

interface CategoriesManagerProps {
  categories: Category[];
  onChanged: () => Promise<void>;
  showToast: ShowToast;
}

function CategoriesManager({
  categories,
  onChanged,
  showToast,
}: CategoriesManagerProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const isEditing = editingId !== null;

  // Mientras se crea, el slug se genera a partir del nombre.
  useEffect(() => {
    if (!isEditing && !slugTouched) {
      setSlug(slugify(name));
    }
  }, [name, isEditing, slugTouched]);

  const inputClass =
    "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus:border-cobalt focus:outline-none disabled:bg-canvas disabled:text-ink-soft";

  function resetForm() {
    setEditingId(null);
    setName("");
    setSlug("");
    setSlugTouched(false);
    setFormError(null);
  }

  function startEdit(category: Category) {
    setEditingId(category.id);
    setName(category.name);
    setSlug(category.slug);
    setSlugTouched(true);
    setFormError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const cleanName = name.trim();
    const cleanSlug = slug.trim();

    if (!cleanName) {
      setFormError("Escribe un nombre para la categoría.");
      return;
    }

    if (!isEditing && !cleanSlug) {
      setFormError("El slug no puede quedar vacío.");
      return;
    }

    setSaving(true);
    try {
      if (editingId !== null) {
        await updateCategory(editingId, { name: cleanName });
        showToast("Categoría actualizada.");
      } else {
        await createCategory({ name: cleanName, slug: cleanSlug });
        showToast("Categoría creada.");
      }
      resetForm();
      await onChanged();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "No se pudo guardar la categoría."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;

    setDeletingBusy(true);
    try {
      await deleteCategory(deleting.id);
      showToast("Categoría eliminada.");
      if (editingId === deleting.id) resetForm();
      setDeleting(null);
      await onChanged();
    } catch (err) {
      setDeleting(null);
      showToast(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar la categoría.",
        "error"
      );
    } finally {
      setDeletingBusy(false);
    }
  }

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <section aria-label="Listado de categorías">
          {categories.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line bg-surface px-6 py-12 text-center">
              <p className="text-sm text-ink-soft">
                Todavía no hay categorías. Crea la primera con el formulario.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {categories.map((category) => (
                <li
                  key={category.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3"
                >
                  <span
                    aria-hidden="true"
                    className="size-3 rounded-[3px]"
                    style={{ backgroundColor: categoryColor(category.slug) }}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink">{category.name}</p>
                    <p className="text-xs text-ink-soft">
                      /{category.slug} ({category._count?.products ?? 0}{" "}
                      {(category._count?.products ?? 0) === 1
                        ? "producto"
                        : "productos"}
                      )
                    </p>
                  </div>

                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(category)}
                      className="rounded-md px-2 py-1 text-xs font-medium text-cobalt transition-colors hover:bg-cobalt-soft"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(category)}
                      className="rounded-md px-2 py-1 text-xs font-medium text-danger transition-colors hover:bg-danger/5"
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-line bg-surface p-5 lg:sticky lg:top-24"
        >
          <h2 className="font-display text-lg font-semibold text-ink">
            {isEditing ? "Renombrar categoría" : "Nueva categoría"}
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            {isEditing
              ? "Cambia el nombre visible. El slug se mantiene."
              : "El slug forma la dirección de la categoría en el catálogo."}
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="category-name"
                className="mb-1.5 block text-sm font-medium text-ink"
              >
                Nombre
              </label>
              <input
                id="category-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                minLength={2}
                maxLength={60}
                placeholder="Jardín"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="category-slug"
                className="mb-1.5 block text-sm font-medium text-ink"
              >
                Slug
              </label>
              <input
                id="category-slug"
                value={slug}
                onChange={(event) => {
                  setSlug(event.target.value);
                  setSlugTouched(true);
                }}
                disabled={isEditing}
                required
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                title="Solo minúsculas, números y guiones"
                placeholder="jardin"
                className={inputClass}
              />
              <p className="mt-1 text-xs text-ink-soft">
                {isEditing
                  ? "El slug no cambia al renombrar."
                  : "Solo minúsculas, números y guiones."}
              </p>
            </div>
          </div>

          {formError && (
            <p
              key={formError}
              role="alert"
              className="animate-shake mt-4 rounded-md border border-danger/30 bg-danger/5 p-3 text-sm leading-relaxed text-danger"
            >
              {formError}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={saving}
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
                : isEditing
                  ? "Guardar nombre"
                  : "Crear categoría"}
            </button>

            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink-soft disabled:opacity-50"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <ConfirmDialog
        open={deleting !== null}
        title="Eliminar categoría"
        description={
          deleting
            ? `"${deleting.name}" se eliminará. Si todavía tiene productos asociados, el servidor no permitirá borrarla.`
            : ""
        }
        busy={deletingBusy}
        onCancel={() => {
          if (!deletingBusy) setDeleting(null);
        }}
        onConfirm={handleDelete}
      />
    </>
  );
}
