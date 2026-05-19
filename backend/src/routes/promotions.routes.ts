import { Router } from "express";
import * as c from "../controllers/promotions.controller";
import { authenticateToken } from "../middlewares/authenticateToken";
import { requireAdmin } from "../middlewares/requireAdmin";

const r = Router();
r.get("/validate/:code", authenticateToken, c.validateCode);
r.get("/", authenticateToken, requireAdmin, c.listAll);
r.post("/", authenticateToken, requireAdmin, c.create);
r.put("/:id", authenticateToken, requireAdmin, c.update);
r.patch("/:id/toggle", authenticateToken, requireAdmin, c.toggle);
export default r;
