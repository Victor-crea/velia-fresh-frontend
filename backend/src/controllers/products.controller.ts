import { Response, NextFunction } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { AuthedRequest, ok, ProductCategory } from "../models/types";
import { HttpError } from "../middlewares/errorHandler";
import { recordAudit } from "../services/audit.service";

const CATEGORIES: ProductCategory[] = ["Res", "Cerdo", "Pollo", "Cordero", "Embutidos"];

const productSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().default(""),
  price: z.number().positive(),
  category: z.enum(CATEGORIES as [ProductCategory, ...ProductCategory[]]),
  stock: z.number().nonnegative().default(0),
  image: z.string().nullable().optional(),
  featured: z.boolean().default(false),
  badge: z.string().nullable().optional(),
  unit: z.string().default("kg"),
});

const updateSchema = productSchema.partial();

/**
 * GET /api/products  — lista pública con filtros opcionales.
 * @query category, search, featured
 */
export async function list(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { category, search, featured } = req.query;
    let q = supabaseAdmin.from("products").select("*").order("created_at", { ascending: false });
    if (typeof category === "string" && category) q = q.eq("category", category);
    if (typeof featured === "string") q = q.eq("featured", featured === "true");
    if (typeof search === "string" && search) q = q.ilike("name", `%${search}%`);
    const { data, error } = await q;
    if (error) throw new HttpError(500, error.message);
    res.json(ok(data ?? []));
  } catch (e) { next(e); }
}

/** GET /api/products/:id */
export async function getOne(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { data, error } = await supabaseAdmin.from("products").select("*").eq("id", req.params.id).maybeSingle();
    if (error) throw new HttpError(500, error.message);
    if (!data) throw new HttpError(404, "Producto no encontrado", "NOT_FOUND");
    res.json(ok(data));
  } catch (e) { next(e); }
}

/** POST /api/products  [admin] */
export async function create(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const body = productSchema.parse(req.body);
    const { data, error } = await supabaseAdmin.from("products").insert(body).select("*").single();
    if (error) throw new HttpError(400, error.message);
    await recordAudit(req, { action: "CREATE_PRODUCT", entity: "product", entity_id: data.id, payload: body });
    res.status(201).json(ok(data));
  } catch (e) { next(e); }
}

/** PUT /api/products/:id  [admin] */
export async function update(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const body = updateSchema.parse(req.body);
    const { data, error } = await supabaseAdmin.from("products").update(body).eq("id", req.params.id).select("*").single();
    if (error) throw new HttpError(400, error.message);
    await recordAudit(req, { action: "UPDATE_PRODUCT", entity: "product", entity_id: req.params.id, payload: body });
    res.json(ok(data));
  } catch (e) { next(e); }
}

/** DELETE /api/products/:id  [admin] */
export async function remove(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { error } = await supabaseAdmin.from("products").delete().eq("id", req.params.id);
    if (error) throw new HttpError(400, error.message);
    await recordAudit(req, { action: "DELETE_PRODUCT", entity: "product", entity_id: req.params.id });
    res.json(ok({ deleted: true }));
  } catch (e) { next(e); }
}
