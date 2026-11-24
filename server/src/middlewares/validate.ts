import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";

type Source = "body" | "query" | "params";

/**
 * Crea un middleware que valida una parte de la petición (body, query o params)
 * contra un esquema Zod. Si es válida, reemplaza el valor original por el
 * resultado ya parseado (con coerción de tipos, valores por defecto, etc.).
 */
export function validate(schema: AnyZodObject, source: Source = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return next(result.error);
    }

    // req.query en Express 4 es un getter sin setter: se redefine la propiedad.
    Object.defineProperty(req, source, {
      value: result.data,
      writable: true,
      configurable: true,
      enumerable: true,
    });

    next();
  };
}
