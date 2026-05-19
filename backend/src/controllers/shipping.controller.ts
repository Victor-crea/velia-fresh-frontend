import { Response, NextFunction } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { AuthedRequest, ok } from "../models/types";
import { HttpError } from "../middlewares/errorHandler";

const zoneSchema = z.object({
  name: z.string().min(1).max(100),
  municipalities: z.array(z.string()).default([]),
  base_cost: z.number().nonnegative(),
  free_from: z.number().nonnegative().default(1500),
  estimated_days: z.number().int().nonnegative().default(1),
  active: z.boolean().optional(),
});

/** GET /api/shipping — zonas activas */
export async function list(_req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { data, error } = await supabaseAdmin.from("shipping_zones").select("*").eq("active", true);
    if (error) throw new HttpError(500, error.message);
    res.json(ok(data ?? []));
  } catch (e) { next(e); }
}

/** POST /api/shipping  [admin] */
export async function create(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const body = zoneSchema.parse(req.body);
    const { data, error } = await supabaseAdmin.from("shipping_zones").insert(body).select("*").single();
    if (error) throw new HttpError(400, error.message);
    res.status(201).json(ok(data));
  } catch (e) { next(e); }
}

/** PUT /api/shipping/:id  [admin] */
export async function update(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const body = zoneSchema.partial().parse(req.body);
    const { data, error } = await supabaseAdmin.from("shipping_zones").update(body).eq("id", req.params.id).select("*").single();
    if (error) throw new HttpError(400, error.message);
    res.json(ok(data));
  } catch (e) { next(e); }
}
