import type {
  Category,
  CategoryInput,
  Product,
  ProductFilters,
  ProductInput,
  ProductListResponse,
} from "../types";

const BASE_URL = "/api";

interface ApiErrorBody {
  error?: string;
  details?: Array<{ campo: string; mensaje: string }>;
}

export class ApiRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
    const details = body?.details ?? [];
    const baseMessage = body?.error ?? `Error ${response.status}`;
    const message = details.length
      ? `${baseMessage}: ${details.map((d) => `${d.campo}: ${d.mensaje}`).join("; ")}`
      : baseMessage;

    throw new ApiRequestError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function getProducts(
  filters: ProductFilters = {},
  signal?: AbortSignal
): Promise<ProductListResponse> {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.category) params.set("category", filters.category);
  if (filters.brand) params.set("brand", filters.brand);
  if (filters.minPrice) params.set("minPrice", filters.minPrice);
  if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));

  return request<ProductListResponse>(`/products?${params.toString()}`, { signal });
}

const MAX_PAGE_SIZE = 50;

/**
 * Recorre todas las páginas del catálogo. La API limita `limit` a 50, así que
 * las vistas que necesitan el catálogo completo (p. ej. Promociones) piden la
 * primera página y luego el resto en paralelo.
 */
export async function getAllProducts(
  filters: Omit<ProductFilters, "page" | "limit"> = {},
  signal?: AbortSignal
): Promise<Product[]> {
  const first = await getProducts({ ...filters, page: 1, limit: MAX_PAGE_SIZE }, signal);

  if (first.totalPages <= 1) return first.products;

  const rest = await Promise.all(
    Array.from({ length: first.totalPages - 1 }, (_, index) =>
      getProducts(
        { ...filters, page: index + 2, limit: MAX_PAGE_SIZE },
        signal
      )
    )
  );

  return [first, ...rest].flatMap((response) => response.products);
}

export function getProduct(id: number | string): Promise<Product> {
  return request<Product>(`/products/${id}`);
}

export function createProduct(input: ProductInput): Promise<Product> {
  return request<Product>("/products", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateProduct(
  id: number,
  input: Partial<ProductInput>
): Promise<Product> {
  return request<Product>(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deleteProduct(id: number): Promise<{ message: string }> {
  return request<{ message: string }>(`/products/${id}`, { method: "DELETE" });
}

export function getCategories(): Promise<Category[]> {
  return request<Category[]>("/categories");
}

export function createCategory(input: CategoryInput): Promise<Category> {
  return request<Category>("/categories", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateCategory(
  id: number,
  input: Partial<CategoryInput>
): Promise<Category> {
  return request<Category>(`/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deleteCategory(id: number): Promise<{ message: string }> {
  return request<{ message: string }>(`/categories/${id}`, { method: "DELETE" });
}
