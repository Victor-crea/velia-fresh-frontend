import { Request } from "express";
import { AuditLog } from "../models/AuditLog";
import { AuthedRequest } from "../models/types";
import { logger } from "../lib/logger";

interface AuditInput {
  action: string;
  entity: string;
  entity_id: string;
  payload?: Record<string, unknown>;
}

/**
 * Registra una entrada de auditoría en MongoDB y emite un log estructurado
 * en winston. Falla silenciosamente para no romper la operación principal.
 */
export async function recordAudit(req: AuthedRequest | Request, input: AuditInput): Promise<void> {
  const u = (req as AuthedRequest).user;
  const reqId = (req as any).reqId;
  logger.info(`audit: ${input.action}`, {
    reqId,
    action: input.action,
    entity: input.entity,
    entityId: input.entity_id,
    userId: u?.id ?? "anonymous",
    role: u?.role ?? "anonymous",
    payload: input.payload ?? {},
  });
  try {
    await AuditLog.create({
      action: input.action,
      entity: input.entity,
      entity_id: input.entity_id,
      user_id: u?.id ?? "anonymous",
      user_role: u?.role ?? "anonymous",
      payload: input.payload ?? {},
      ip: req.ip,
      user_agent: req.get("user-agent") ?? "",
      timestamp: new Date(),
    });
  } catch (err) {
    logger.error("audit: failed to persist", { reqId, error: (err as Error)?.message });
  }
}

