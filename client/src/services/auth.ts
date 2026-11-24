import type { AuthResponse, User } from "../types";

const BASE_URL = "/api";

interface ApiErrorBody {
  error?: string;
  details?: Array<{ campo: string; mensaje: string }>;
}

export class AuthApiError extends Error {
  status: number;
  details: Array<{ campo: string; mensaje: string }>;

  constructor(message: string, status: number, details: Array<{ campo: string; mensaje: string }> = []) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
    this.details = details;
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
    throw new AuthApiError(baseMessage, response.status, details);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function registerUser(input: { name: string; email: string; password: string }) {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function loginUser(input: { email: string; password: string }) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getMe(token: string) {
  return request<{ user: User }>("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function updateMe(token: string, input: Partial<{ name: string; email: string; password: string; currentPassword: string }>) {
  return request<{ user: User }>("/auth/me", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
}

export function confirmOAuthLink(input: { pendingToken: string; password?: string }, token?: string | null) {
  return request<AuthResponse & { redirect?: string }>("/auth/link/confirm", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: JSON.stringify(input),
  });
}
