import { Response, NextFunction } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { AuthedRequest, ok } from "../models/types";
import { HttpError } from "../middlewares/errorHandler";

const profileUpdateSchema = z.object({
  full_name: z.string().min(1).max(100).optional(),
  phone: z.string().max(30).optional(),
  address: z.string().max(500).optional(),
});

/** GET /api/users/profile  [auth] */
export async function getProfile(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, "No autenticado");
    const { data, error } = await supabaseAdmin
      .from("profiles").select("*").eq("user_id", req.user.id).maybeSingle();
    if (error) throw new HttpError(500, error.message);
    res.json(ok(data));
  } catch (e) { next(e); }
}

/** PUT /api/users/profile  [auth] */
export async function updateProfile(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, "No autenticado");
    const body = profileUpdateSchema.parse(req.body);
    const { data, error } = await supabaseAdmin
      .from("profiles").update(body).eq("user_id", req.user.id).select("*").single();
    if (error) throw new HttpError(400, error.message);
    res.json(ok(data));
  } catch (e) { next(e); }
}

/** GET /api/users  [admin] — lista usuarios con su rol */
export async function listAll(_req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { data: profiles, error } = await supabaseAdmin
      .from("profiles").select("*").order("created_at", { ascending: false });
    if (error) throw new HttpError(500, error.message);
    const { data: roles } = await supabaseAdmin.from("user_roles").select("user_id, role");
    const roleMap = new Map<string, string>();
    (roles ?? []).forEach((r) => {
      const prev = roleMap.get(r.user_id);
      if (!prev || r.role === "admin") roleMap.set(r.user_id, r.role);
    });
    const merged = (profiles ?? []).map((p) => ({ ...p, role: roleMap.get(p.user_id) ?? "cliente" }));
    res.json(ok(merged));
  } catch (e) { next(e); }
}
