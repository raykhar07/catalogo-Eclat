import type { MyOrdersResponse, OrderCreateInput, OrderResponse } from "../types";

const API_BASE = "/api";

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const error = new Error(
      (data && (data.error || data.message)) || `Error ${response.status}`
    ) as Error & { details?: Array<{ campo: string; mensaje: string }> };
    if (data?.details) {
      error.details = data.details;
    }
    throw error;
  }

  return data as T;
}

export async function createOrder(input: OrderCreateInput): Promise<OrderResponse> {
  const token = localStorage.getItem("estante-auth-token");
  const response = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(input),
  });

  return handleResponse<OrderResponse>(response);
}

export type CreateCartOrderInput = {
  items: Array<{ productId: number; quantity: number }>;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerAddress: string;
  buyerCity: string;
  paymentMethod: "card" | "nequi" | "pse";
  nequiPhone?: string;
  pseBank?: string;
  psePersonType?: "natural" | "juridica";
  pseId?: string;
};

export async function createCartOrder(input: CreateCartOrderInput): Promise<OrderResponse> {
  const token = localStorage.getItem("estante-auth-token");
  const response = await fetch(`${API_BASE}/orders/cart`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(input),
  });

  return handleResponse<OrderResponse>(response);
}

export async function getMyOrders(): Promise<MyOrdersResponse> {
  const token = localStorage.getItem("estante-auth-token");
  const response = await fetch(`${API_BASE}/orders/me`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  return handleResponse<MyOrdersResponse>(response);
}
