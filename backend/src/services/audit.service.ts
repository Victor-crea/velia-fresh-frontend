import { Request } from "express";
import { AuditLog } from "../models/AuditLog";
import { AuthedRequest } from "../models/types";

interface AuditInput {
  action: string;
  entity: string;
  entity_id: string;
  payload?: Record<string, unknown>;
}

/**
 * Registra una entrada de auditoría en MongoDB.
 * Falla silenciosamente para no romper la operación principal.
 */
export async function recordAudit(req: AuthedRequest | Request, input: AuditInput): Promise<void> {
  try {
    const u = (req as AuthedRequest).user;
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
    console.error("[audit] failed to record:", err);
  }
}
