import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

/**
 * Error controlado que los controllers pueden lanzar con un status HTTP concreto.
 */
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/**
 * Middleware para rutas no encontradas.
 */
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
}

/**
 * Middleware centralizado de errores. Convierte errores de Zod y Prisma
 * en respuestas JSON con mensajes legibles.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Errores de validación de Zod
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Datos inválidos",
      details: err.issues.map((issue) => ({
        campo: issue.path.join(".") || "(general)",
        mensaje: issue.message,
      })),
    });
  }

  // Errores conocidos de Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({
        error: "Ya existe un registro con esos datos (valor duplicado).",
      });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ error: "El registro solicitado no existe." });
    }
    if (err.code === "P2003") {
      return res.status(400).json({
        error: "La categoría indicada no existe.",
      });
    }
  }

  // Cuerpo JSON malformado (body-parser)
  if (
    typeof err === "object" &&
    err !== null &&
    "type" in err &&
    (err as { type?: string }).type === "entity.parse.failed"
  ) {
    return res.status(400).json({ error: "El cuerpo de la petición no es un JSON válido." });
  }

  // Errores controlados lanzados por los controllers
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message });
  }

  console.error("Error no controlado:", err);
  return res.status(500).json({ error: "Error interno del servidor." });
}
