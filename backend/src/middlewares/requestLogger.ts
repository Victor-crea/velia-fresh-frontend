import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import { logger } from "../lib/logger";
import { AuthedRequest } from "../models/types";

/**
 * Middleware que asigna un request-id, registra inicio/fin de cada petición HTTP
 * con método, ruta, status, duración (ms) y usuario si está autenticado.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const reqId = (req.headers["x-request-id"] as string) || randomUUID();
  (req as any).reqId = reqId;
  res.setHeader("x-request-id", reqId);

  const start = Date.now();
  logger.info("→ request", {
    reqId,
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
  });

  res.on("finish", () => {
    const durMs = Date.now() - start;
    const u = (req as AuthedRequest).user;
    const meta = {
      reqId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durMs,
      userId: u?.id,
      role: u?.role,
    };
    if (res.statusCode >= 500) logger.error("← response", meta);
    else if (res.statusCode >= 400) logger.warn("← response", meta);
    else logger.info("← response", meta);
  });

  next();
}
