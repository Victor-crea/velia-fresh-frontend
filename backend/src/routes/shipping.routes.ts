import { Router } from "express";
import * as c from "../controllers/shipping.controller";
import { authenticateToken } from "../middlewares/authenticateToken";
import { requireAdmin } from "../middlewares/requireAdmin";

const r = Router();
r.get("/", c.list);
r.post("/", authenticateToken, requireAdmin, c.create);
r.put("/:id", authenticateToken, requireAdmin, c.update);
export default r;
