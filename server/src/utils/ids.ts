import { ApiError } from "../middlewares/errorHandler";

/**
 * Convierte el parámetro `:id` de la URL en un entero positivo.
 * Lanza un 400 si no es un ID válido.
 */
export function parseId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(400, `ID inválido: "${raw}"`);
  }
  return id;
}
