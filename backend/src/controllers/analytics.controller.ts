import { Response, NextFunction } from "express";
import { z } from "zod";
import { ProductView } from "../models/ProductView";
import { AuditLog } from "../models/AuditLog";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { AuthedRequest, ok } from "../models/types";
import { HttpError } from "../middlewares/errorHandler";

const viewSchema = z.object({
  product_id: z.string().min(1),
  session_id: z.string().optional(),
  source: z.enum(["catalog", "home", "search", "direct"]).default("direct"),
  duration_seconds: z.number().nonnegative().default(0),
});

/** POST /api/analytics/view — público (acepta anónimos) */
export async function recordView(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const body = viewSchema.parse(req.body);
    const doc = await ProductView.create({
      product_id: body.product_id,
      user_id: req.user?.id ?? null,
      session_id: body.session_id,
      source: body.source,
      duration_seconds: body.duration_seconds,
      viewed_at: new Date(),
    });
    res.status(201).json(ok({ id: String(doc._id) }));
  } catch (e) { next(e); }
}

/** GET /api/analytics/popular  [admin] — top 10 (30 días) */
export async function popular(_req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const agg = await ProductView.aggregate([
      { $match: { viewed_at: { $gte: since } } },
      { $group: { _id: "$product_id", views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 10 },
    ]);
    const ids = agg.map((a) => a._id as string);
    let products: Array<{ id: string; name: string; price: number; image: string | null }> = [];
    if (ids.length) {
      const { data } = await supabaseAdmin.from("products").select("id, name, price, image").in("id", ids);
      products = (data ?? []) as typeof products;
    }
    const result = agg.map((a) => {
      const p = products.find((x) => x.id === a._id);
      return { product_id: a._id, views: a.views, product: p ?? null };
    });
    res.json(ok(result));
  } catch (e) { next(e); }
}

/** GET /api/analytics/audit  [admin] — últimos 100 */
export async function recentAudit(_req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100).lean();
    res.json(ok(logs));
  } catch (e) { next(e); }
}
