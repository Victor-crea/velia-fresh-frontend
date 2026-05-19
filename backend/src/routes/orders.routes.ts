import { Router } from "express";
import * as c from "../controllers/orders.controller";
import { authenticateToken } from "../middlewares/authenticateToken";
import { requireAdmin } from "../middlewares/requireAdmin";

const r = Router();
r.post("/", authenticateToken, c.create);
r.get("/my", authenticateToken, c.myOrders);
r.get("/", authenticateToken, requireAdmin, c.listAll);
r.get("/:id", authenticateToken, c.getOne);
r.patch("/:id/status", authenticateToken, requireAdmin, c.updateStatus);
export default r;
