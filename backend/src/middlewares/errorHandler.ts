import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { fail } from "../models/types";
import { logger } from "../lib/logger";

export class HttpError extends Error {
  status: number;
  code?: string;
  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/**
 * Manejador global de errores. Siempre responde { success:false, error, code? }
 * y registra en winston con contexto de la petición.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const reqId = (req as any).reqId;
  const ctx = { reqId, method: req.method, path: req.originalUrl };

  if (err instanceof ZodError) {
    logger.warn("validation error", { ...ctx, issues: err.issues });
    res.status(400).json(fail(err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "), "VALIDATION_ERROR"));
    return;
  }
  if (err instanceof HttpError) {
    logger.warn("http error", { ...ctx, status: err.status, code: err.code, message: err.message });
    res.status(err.status).json(fail(err.message, err.code));
    return;
  }
  const e = err as Error;
  logger.error("unhandled error", { ...ctx, message: e?.message, stack: e?.stack });
  res.status(500).json(fail(e?.message ?? "Error interno del servidor", "INTERNAL_ERROR"));
}
