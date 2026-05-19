import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { fail } from "../models/types";

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
 * Manejador global de errores. Siempre responde { success:false, error, code? }.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    console.warn("[zod]", err.issues);
    res.status(400).json(fail(err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "), "VALIDATION_ERROR"));
    return;
  }
  if (err instanceof HttpError) {
    console.warn(`[http ${err.status}]`, err.message);
    res.status(err.status).json(fail(err.message, err.code));
    return;
  }
  const e = err as Error;
  console.error("[error]", e?.stack ?? e);
  res.status(500).json(fail(e?.message ?? "Error interno del servidor", "INTERNAL_ERROR"));
}
