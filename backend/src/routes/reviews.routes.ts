import { Router } from "express";
import * as c from "../controllers/reviews.controller";
import { authenticateToken } from "../middlewares/authenticateToken";
import { requireAdmin } from "../middlewares/requireAdmin";

const r = Router();
r.post("/", authenticateToken, c.create);
r.get("/product/:productId", c.listForProduct);
r.get("/pending", authenticateToken, requireAdmin, c.listPending);
r.patch("/:id/approve", authenticateToken, requireAdmin, c.approve);
export default r;
