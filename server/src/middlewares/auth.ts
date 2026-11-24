import { NextFunction, Request, Response } from "express";
import { ApiError } from "./errorHandler";
import { verifyToken } from "../utils/auth";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export function requireAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw new ApiError(401, "Token de autenticación requerido");
  }

  const token = header.slice("Bearer ".length).trim();
  try {
    const payload = verifyToken(token);
    req.user = { id: payload.id, email: payload.email, role: payload.role };
    next();
  } catch (error) {
    throw new ApiError(401, "Token inválido o expirado");
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, "Token de autenticación requerido");
    }
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, "No tienes permisos para realizar esta acción");
    }
    next();
  };
}
