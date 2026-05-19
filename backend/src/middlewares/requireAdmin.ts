import { Response, NextFunction } from "express";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { AuthedRequest, fail } from "../models/types";

/**
 * Verifica que el usuario autenticado tenga rol "admin" en user_roles.
 * Debe ejecutarse DESPUÉS de authenticateToken.
 */
export async function requireAdmin(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    res.status(401).json(fail("No autenticado", "NO_AUTH"));
    return;
  }
  if (req.user.role === "admin") {
    next();
    return;
  }
  // Double-check contra la BD por si el rol cambió mid-session
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", req.user.id)
    .eq("role", "admin")
    .maybeSingle();
  if (data) {
    req.user.role = "admin";
    next();
    return;
  }
  res.status(403).json(fail("Acceso denegado: se requiere rol admin", "FORBIDDEN"));
}
