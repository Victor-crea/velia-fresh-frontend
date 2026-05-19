import { Response, NextFunction } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { AuthedRequest, ok } from "../models/types";
import { HttpError } from "../middlewares/errorHandler";

const categorySchema = z.object({
  name: z.string().min(1).max(50),
  emoji: z.string().max(10).optional(),
  description: z.string().optional(),
  active: z.boolean().optional(),
  sort_order: z.number().int().optional(),
});

/** GET /api/categories — públicas y activas */
export async function list(_req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { data, error } = await supabaseAdmin
      .from("categories").select("*").eq("active", true).order("sort_order");
    if (error) throw new HttpError(500, error.message);
    res.json(ok(data ?? []));
  } catch (e) { next(e); }
}

/** POST /api/categories  [admin] */
export async function create(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const body = categorySchema.parse(req.body);
    const { data, error } = await supabaseAdmin.from("categories").insert(body).select("*").single();
    if (error) throw new HttpError(400, error.message);
    res.status(201).json(ok(data));
  } catch (e) { next(e); }
}

/** PUT /api/categories/:id  [admin] */
export async function update(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const body = categorySchema.partial().parse(req.body);
    const { data, error } = await supabaseAdmin.from("categories").update(body).eq("id", req.params.id).select("*").single();
    if (error) throw new HttpError(400, error.message);
    res.json(ok(data));
  } catch (e) { next(e); }
}

/** DELETE /api/categories/:id  [admin] */
export async function remove(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { error } = await supabaseAdmin.from("categories").delete().eq("id", req.params.id);
    if (error) throw new HttpError(400, error.message);
    res.json(ok({ deleted: true }));
  } catch (e) { next(e); }
}
