import { Router, Request, Response } from "express";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { logger } from "../lib/logger";

/**
 * Rutas SOLO para entornos de pruebas E2E (Cypress / Playwright).
 * Se montan únicamente cuando `process.env.ENABLE_TEST_ENDPOINTS === "true"`.
 * Protegidas con el header `x-testing-token` (debe coincidir con
 * `process.env.TESTING_RESET_TOKEN`).
 */
const r = Router();

function guard(req: Request, res: Response): boolean {
  const token = req.headers["x-testing-token"];
  const expected = process.env.TESTING_RESET_TOKEN;
  if (!expected || token !== expected) {
    res.status(401).json({ success: false, error: "Token de testing inválido" });
    return false;
  }
  return true;
}

/**
 * Resetea la BD para tests: borra order_items, orders y productos de prueba
 * (los que llevan el prefijo "E2E "). Idempotente.
 */
r.post("/reset", async (req: Request, res: Response) => {
  if (!guard(req, res)) return;
  try {
    await supabaseAdmin.from("order_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabaseAdmin.from("orders").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabaseAdmin.from("products").delete().like("name", "E2E %");
    logger.info("testing: reset DB ejecutado");
    res.json({ success: true, data: { reset: true } });
  } catch (err: any) {
    logger.error("testing: reset fallo", { message: err?.message });
    res.status(500).json({ success: false, error: err?.message ?? "reset failed" });
  }
});

/**
 * Crea un producto de prueba (debe llevar prefijo "E2E ").
 */
r.post("/seed-product", async (req: Request, res: Response) => {
  if (!guard(req, res)) return;
  const body = req.body ?? {};
  const name: string = String(body.name ?? "E2E Producto");
  if (!name.startsWith("E2E ")) {
    return res.status(400).json({ success: false, error: "name debe iniciar con 'E2E '" });
  }
  const payload = {
    name,
    description: body.description ?? "Seed E2E",
    price: Number(body.price ?? 100),
    category: body.category ?? "Res",
    stock: Number(body.stock ?? 10),
    image: body.image ?? null,
    featured: !!body.featured,
    badge: body.badge ?? null,
    unit: body.unit ?? "kg",
  };
  const { data, error } = await supabaseAdmin.from("products").insert(payload).select("id").single();
  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, data });
});

export default r;
