import { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Envuelve un handler async para que cualquier error (o promesa rechazada)
 * se derive al middleware de errores. Necesario en Express 4.
 */
export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
