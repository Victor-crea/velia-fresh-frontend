import { Router } from "express";
import * as c from "../controllers/auth.controller";
import { authenticateToken } from "../middlewares/authenticateToken";

const r = Router();
r.post("/register", c.register);
r.post("/login", c.login);
r.post("/logout", authenticateToken, c.logout);
r.get("/me", authenticateToken, c.me);
export default r;
