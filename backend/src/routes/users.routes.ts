import { Router } from "express";
import * as c from "../controllers/users.controller";
import { authenticateToken } from "../middlewares/authenticateToken";
import { requireAdmin } from "../middlewares/requireAdmin";

const r = Router();
r.get("/profile", authenticateToken, c.getProfile);
r.put("/profile", authenticateToken, c.updateProfile);
r.get("/", authenticateToken, requireAdmin, c.listAll);
export default r;
