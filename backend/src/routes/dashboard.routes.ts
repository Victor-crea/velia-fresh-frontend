import { Router } from "express";
import * as c from "../controllers/dashboard.controller";
import { authenticateToken } from "../middlewares/authenticateToken";
import { requireAdmin } from "../middlewares/requireAdmin";

const r = Router();
r.get("/stats", authenticateToken, requireAdmin, c.stats);
export default r;
