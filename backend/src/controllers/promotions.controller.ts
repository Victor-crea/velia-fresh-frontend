import { Response, NextFunction } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { AuthedRequest, ok } from "../models/types";
import { HttpError } from "../middlewares/errorHandler";

const promoSchema = z.object({
  code: z.string().min(2).max(30),
  description: z.string().optional(),
  type: z.enum(["percentage", "fixed"]),
  value: z.number().positive(),
  min_order: z.number().nonnegative().default(0),
  max_uses: z.number().int().positive().nullable().optional(),
  valid_from: z.string().datetime().optional(),
  valid_until: z.string().datetime().optional(),
  active: z.boolean().optional(),
});

/** GET /api/promotions/validate/:code  [auth]
 *  Solo valida y calcula descuento; NO incrementa uses_count (eso lo hace POST /orders). */
export async function validateCode(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const subtotalRaw = Number(req.query.subtotal ?? 0);
    const { data: p, error } = await supabaseAdmin
      .from("promotions").select("*").eq("code", req.params.code).maybeSingle();
    if (error) throw new HttpError(500, error.message);
    if (!p) throw new HttpError(404, "Código no encontrado", "PROMO_NOT_FOUND");
    if (!p.active) throw new HttpError(400, "Código inactivo");
    const now = new Date();
    if (p.valid_from && new Date(p.valid_from) > now) throw new HttpError(400, "Aún no vigente");
    if (p.valid_until && new Date(p.valid_until) < now) throw new HttpError(400, "Expirado");
    if (p.max_uses !== null && p.uses_count >= p.max_uses) throw new HttpError(400, "Agotado");
    if (Number(p.min_order) > subtotalRaw) {
      throw new HttpError(400, `Pedido mínimo $${p.min_order}`, "MIN_ORDER_NOT_MET");
    }
    const discount = p.type === "percentage"
      ? (subtotalRaw * Number(p.value)) / 100
      : Number(p.value);
    res.json(ok({
      code: p.code, type: p.type, value: Number(p.value),
      discount, subtotal: subtotalRaw, total: Math.max(0, subtotalRaw - discount),
    }));
  } catch (e) { next(e); }
}

/** GET /api/promotions  [admin] */
export async function listAll(_req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { data, error } = await supabaseAdmin.from("promotions").select("*").order("created_at", { ascending: false });
    if (error) throw new HttpError(500, error.message);
    res.json(ok(data ?? []));
  } catch (e) { next(e); }
}

/** POST /api/promotions  [admin] */
export async function create(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const body = promoSchema.parse(req.body);
    const { data, error } = await supabaseAdmin.from("promotions").insert(body).select("*").single();
    if (error) throw new HttpError(400, error.message);
    res.status(201).json(ok(data));
  } catch (e) { next(e); }
}

/** PUT /api/promotions/:id  [admin] */
export async function update(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const body = promoSchema.partial().parse(req.body);
    const { data, error } = await supabaseAdmin.from("promotions").update(body).eq("id", req.params.id).select("*").single();
    if (error) throw new HttpError(400, error.message);
    res.json(ok(data));
  } catch (e) { next(e); }
}

/** PATCH /api/promotions/:id/toggle  [admin] */
export async function toggle(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { data: cur, error: e1 } = await supabaseAdmin.from("promotions").select("active").eq("id", req.params.id).single();
    if (e1) throw new HttpError(404, "No encontrada");
    const { data, error } = await supabaseAdmin.from("promotions").update({ active: !cur.active }).eq("id", req.params.id).select("*").single();
    if (error) throw new HttpError(400, error.message);
    res.json(ok(data));
  } catch (e) { next(e); }
}
