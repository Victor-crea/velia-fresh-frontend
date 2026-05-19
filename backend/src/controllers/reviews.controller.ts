import { Response, NextFunction } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { AuthedRequest, ok } from "../models/types";
import { HttpError } from "../middlewares/errorHandler";

const reviewSchema = z.object({
  product_id: z.string().uuid(),
  order_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

/**
 * POST /api/reviews  [auth]
 * Solo permite reseñar si el usuario compró el producto en ese order_id.
 */
export async function create(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, "No autenticado");
    const body = reviewSchema.parse(req.body);

    // Verifica que el pedido sea del usuario y contenga el producto
    const { data: order } = await supabaseAdmin
      .from("orders").select("id, user_id").eq("id", body.order_id).maybeSingle();
    if (!order || order.user_id !== req.user.id) {
      throw new HttpError(403, "No puedes reseñar este pedido", "NOT_OWNER");
    }
    const { data: item } = await supabaseAdmin
      .from("order_items").select("id")
      .eq("order_id", body.order_id).eq("product_id", body.product_id).maybeSingle();
    if (!item) throw new HttpError(400, "El producto no está en ese pedido", "NOT_PURCHASED");

    const { data, error } = await supabaseAdmin
      .from("product_reviews")
      .insert({ ...body, user_id: req.user.id, approved: false })
      .select("*").single();
    if (error) throw new HttpError(400, error.message);
    res.status(201).json(ok(data));
  } catch (e) { next(e); }
}

/** GET /api/reviews/product/:productId — solo aprobadas */
export async function listForProduct(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { data, error } = await supabaseAdmin
      .from("product_reviews").select("*")
      .eq("product_id", req.params.productId).eq("approved", true)
      .order("created_at", { ascending: false });
    if (error) throw new HttpError(500, error.message);
    res.json(ok(data ?? []));
  } catch (e) { next(e); }
}

/** GET /api/reviews/pending  [admin] */
export async function listPending(_req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { data, error } = await supabaseAdmin
      .from("product_reviews").select("*").eq("approved", false)
      .order("created_at", { ascending: false });
    if (error) throw new HttpError(500, error.message);
    res.json(ok(data ?? []));
  } catch (e) { next(e); }
}

/** PATCH /api/reviews/:id/approve  [admin] */
export async function approve(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { data, error } = await supabaseAdmin
      .from("product_reviews").update({ approved: true })
      .eq("id", req.params.id).select("*").single();
    if (error) throw new HttpError(400, error.message);
    res.json(ok(data));
  } catch (e) { next(e); }
}
