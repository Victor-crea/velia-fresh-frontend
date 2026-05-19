import { Router } from "express";
import * as c from "../controllers/products.controller";
import { authenticateToken } from "../middlewares/authenticateToken";
import { requireAdmin } from "../middlewares/requireAdmin";

const r = Router();
r.get("/", c.list);
r.get("/:id", c.getOne);
r.post("/", authenticateToken, requireAdmin, c.create);
r.put("/:id", authenticateToken, requireAdmin, c.update);
r.delete("/:id", authenticateToken, requireAdmin, c.remove);
export default r;
