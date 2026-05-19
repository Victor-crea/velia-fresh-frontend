import { Response, NextFunction } from "express";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { ProductView } from "../models/ProductView";
import { AuthedRequest, ok, OrderStatus } from "../models/types";
import { HttpError } from "../middlewares/errorHandler";

/**
 * GET /api/dashboard/stats  [admin]
 * Métricas globales: ingresos, pedidos por estado, totales, top productos, últimos pedidos.
 */
export async function stats(_req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const [ordersRes, productsRes, profilesRes] = await Promise.all([
      supabaseAdmin.from("orders").select("id, total, status, created_at"),
      supabaseAdmin.from("products").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("profiles").select("user_id", { count: "exact", head: true }),
    ]);
    if (ordersRes.error) throw new HttpError(500, ordersRes.error.message);

    const orders = ordersRes.data ?? [];
    const total_revenue = orders
      .filter((o) => o.status !== "cancelado")
      .reduce((s, o) => s + Number(o.total), 0);

    const orders_by_status: Record<OrderStatus, number> = {
      pendiente: 0, preparando: 0, entregado: 0, cancelado: 0,
    };
    orders.forEach((o) => { orders_by_status[o.status as OrderStatus]++; });

    // Top productos (Mongo views, 30 días)
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const topAgg = await ProductView.aggregate([
      { $match: { viewed_at: { $gte: since } } },
      { $group: { _id: "$product_id", views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 5 },
    ]);
    const topIds = topAgg.map((t) => t._id as string);
    let topProducts: Array<{ id: string; name: string; views: number }> = [];
    if (topIds.length) {
      const { data: prods } = await supabaseAdmin.from("products").select("id, name").in("id", topIds);
      topProducts = topAgg.map((t) => ({
        id: t._id,
        name: (prods ?? []).find((p) => p.id === t._id)?.name ?? "—",
        views: t.views,
      }));
    }

    const { data: recent_orders } = await supabaseAdmin
      .from("orders").select("*").order("created_at", { ascending: false }).limit(5);

    res.json(ok({
      total_revenue,
      orders_by_status,
      total_orders: orders.length,
      total_products: productsRes.count ?? 0,
      total_customers: profilesRes.count ?? 0,
      top_products: topProducts,
      recent_orders: recent_orders ?? [],
    }));
  } catch (e) { next(e); }
}
