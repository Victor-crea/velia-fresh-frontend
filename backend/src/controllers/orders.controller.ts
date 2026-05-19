import { Response, NextFunction } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { AuthedRequest, ok, OrderStatus } from "../models/types";
import { HttpError } from "../middlewares/errorHandler";
import { recordAudit } from "../services/audit.service";
import { notifyUser } from "../services/notification.service";

const STATUSES: OrderStatus[] = ["pendiente", "preparando", "entregado", "cancelado"];

const orderItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().positive(),
});

const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1),
  shipping_address: z.string().min(1),
  notes: z.string().optional(),
  promo_code: z.string().optional(),
});

const statusSchema = z.object({
  status: z.enum(STATUSES as [OrderStatus, ...OrderStatus[]]),
});

/**
 * POST /api/orders  [auth]
 * Crea order + order_items en transacción manual (rollback si falla items).
 * Aplica promo_code si corresponde e incrementa uses_count.
 */
export async function create(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, "No autenticado");
    const body = createOrderSchema.parse(req.body);

    // Fetch productos para precios reales + stock
    const ids = body.items.map((i) => i.product_id);
    const { data: products, error: pErr } = await supabaseAdmin
      .from("products")
      .select("id, name, price, stock")
      .in("id", ids);
    if (pErr) throw new HttpError(500, pErr.message);
    if (!products || products.length !== ids.length) {
      throw new HttpError(400, "Uno o más productos no existen", "INVALID_PRODUCT");
    }

    const itemsResolved = body.items.map((i) => {
      const p = products.find((x) => x.id === i.product_id)!;
      if (Number(p.stock) < i.quantity) {
        throw new HttpError(400, `Stock insuficiente para ${p.name}`, "OUT_OF_STOCK");
      }
      return { ...i, name: p.name, price: Number(p.price) };
    });

    let subtotal = itemsResolved.reduce((s, i) => s + i.price * i.quantity, 0);
    let discount = 0;
    let promo: { id: string; code: string } | null = null;

    if (body.promo_code) {
      const { data: prom } = await supabaseAdmin
        .from("promotions")
        .select("*")
        .eq("code", body.promo_code)
        .eq("active", true)
        .maybeSingle();
      if (!prom) throw new HttpError(400, "Código promocional inválido", "INVALID_PROMO");
      const now = new Date();
      if (prom.valid_from && new Date(prom.valid_from) > now) throw new HttpError(400, "Promoción aún no vigente");
      if (prom.valid_until && new Date(prom.valid_until) < now) throw new HttpError(400, "Promoción expirada");
      if (prom.max_uses !== null && prom.uses_count >= prom.max_uses) throw new HttpError(400, "Promoción agotada");
      if (Number(prom.min_order) > subtotal) throw new HttpError(400, `Pedido mínimo $${prom.min_order}`);
      discount = prom.type === "percentage"
        ? (subtotal * Number(prom.value)) / 100
        : Number(prom.value);
      promo = { id: prom.id, code: prom.code };
    }

    const total = Math.max(0, subtotal - discount);

    // 1) Insert order
    const { data: order, error: oErr } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: req.user.id,
        total,
        shipping_address: body.shipping_address,
        notes: body.notes ?? null,
        status: "pendiente",
      })
      .select("*")
      .single();
    if (oErr || !order) throw new HttpError(500, oErr?.message ?? "No se pudo crear el pedido");

    // 2) Insert items — rollback si falla
    const itemsPayload = itemsResolved.map((i) => ({
      order_id: order.id,
      product_id: i.product_id,
      product_name: i.name,
      quantity: i.quantity,
      price: i.price,
    }));
    const { error: iErr } = await supabaseAdmin.from("order_items").insert(itemsPayload);
    if (iErr) {
      await supabaseAdmin.from("orders").delete().eq("id", order.id);
      throw new HttpError(500, `Rollback: ${iErr.message}`, "ORDER_ITEMS_FAILED");
    }

    // 3) Decrementa stock
    for (const i of itemsResolved) {
      const prod = products.find((p) => p.id === i.product_id)!;
      await supabaseAdmin.from("products").update({ stock: Number(prod.stock) - i.quantity }).eq("id", i.product_id);
    }

    // 4) Incrementa uses de la promo si aplica
    if (promo) {
      await supabaseAdmin.rpc("noop").catch(() => null); // placeholder if not present
      const { data: cur } = await supabaseAdmin.from("promotions").select("uses_count").eq("id", promo.id).single();
      await supabaseAdmin.from("promotions").update({ uses_count: Number(cur?.uses_count ?? 0) + 1 }).eq("id", promo.id);
    }

    await recordAudit(req, {
      action: "CREATE_ORDER",
      entity: "order",
      entity_id: order.id,
      payload: { total, items_count: itemsResolved.length, promo: promo?.code ?? null },
    });

    await notifyUser({
      user_id: req.user.id,
      type: "order_status",
      title: "Pedido recibido",
      body: `Tu pedido #${order.id.slice(0, 8).toUpperCase()} fue creado y está pendiente de preparación.`,
      data: { order_id: order.id, new_status: "pendiente" },
    });

    res.status(201).json(ok({ order, items: itemsPayload, subtotal, discount, total }));
  } catch (e) { next(e); }
}

/** GET /api/orders/my  [auth] */
export async function myOrders(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, "No autenticado");
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*)")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });
    if (error) throw new HttpError(500, error.message);
    res.json(ok(data ?? []));
  } catch (e) { next(e); }
}

/** GET /api/orders  [admin] */
export async function listAll(_req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });
    if (error) throw new HttpError(500, error.message);
    res.json(ok(data ?? []));
  } catch (e) { next(e); }
}

/** GET /api/orders/:id  [auth — propietario o admin] */
export async function getOne(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, "No autenticado");
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", req.params.id)
      .maybeSingle();
    if (error) throw new HttpError(500, error.message);
    if (!data) throw new HttpError(404, "Pedido no encontrado", "NOT_FOUND");
    if (data.user_id !== req.user.id && req.user.role !== "admin") {
      throw new HttpError(403, "No puedes ver este pedido", "FORBIDDEN");
    }
    res.json(ok(data));
  } catch (e) { next(e); }
}

/** PATCH /api/orders/:id/status  [admin] */
export async function updateStatus(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const body = statusSchema.parse(req.body);
    const { data, error } = await supabaseAdmin
      .from("orders")
      .update({ status: body.status })
      .eq("id", req.params.id)
      .select("*")
      .single();
    if (error) throw new HttpError(400, error.message);

    await recordAudit(req, {
      action: "UPDATE_ORDER_STATUS",
      entity: "order",
      entity_id: data.id,
      payload: { new_status: body.status },
    });

    await notifyUser({
      user_id: data.user_id,
      type: "order_status",
      title: "Actualización de tu pedido",
      body: `Tu pedido #${data.id.slice(0, 8).toUpperCase()} ahora está: ${body.status}`,
      data: { order_id: data.id, new_status: body.status },
    });

    res.json(ok(data));
  } catch (e) { next(e); }
}
