import { Router } from "express";
import * as c from "../controllers/categories.controller";
import { authenticateToken } from "../middlewares/authenticateToken";
import { requireAdmin } from "../middlewares/requireAdmin";

const r = Router();
r.get("/", c.list);
r.post("/", authenticateToken, requireAdmin, c.create);
r.put("/:id", authenticateToken, requireAdmin, c.update);
r.delete("/:id", authenticateToken, requireAdmin, c.remove);
export default r;
