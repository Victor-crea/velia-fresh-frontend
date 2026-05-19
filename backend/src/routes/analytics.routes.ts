import { Router } from "express";
import * as c from "../controllers/analytics.controller";
import { authenticateToken } from "../middlewares/authenticateToken";
import { requireAdmin } from "../middlewares/requireAdmin";

const r = Router();
r.post("/view", c.recordView);
r.get("/popular", authenticateToken, requireAdmin, c.popular);
r.get("/audit", authenticateToken, requireAdmin, c.recentAudit);
export default r;
