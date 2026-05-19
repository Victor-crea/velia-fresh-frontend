import { Response, NextFunction } from "express";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { AuthedRequest, AppRole, fail } from "../models/types";

/**
 * Verifica el JWT de Supabase enviado como `Authorization: Bearer <token>`.
 * Adjunta `req.user = { id, email, role }`.
 */
export async function authenticateToken(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    res.status(401).json(fail("Token no proporcionado", "NO_TOKEN"));
    return;
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    res.status(401).json(fail("Token inválido o expirado", "INVALID_TOKEN"));
    return;
  }

  // Resolve role
  let role: AppRole | null = null;
  const { data: rows } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", data.user.id);
  if (rows && rows.length) {
    role = rows.some((r) => r.role === "admin") ? "admin" : "cliente";
  }

  req.user = {
    id: data.user.id,
    email: data.user.email ?? "",
    role,
  };
  next();
}
