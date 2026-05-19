import { Router } from "express";
import * as c from "../controllers/notifications.controller";
import { authenticateToken } from "../middlewares/authenticateToken";

const r = Router();
r.get("/my", authenticateToken, c.myNotifications);
r.patch("/:id/read", authenticateToken, c.markRead);
r.get("/unread-count", authenticateToken, c.unreadCount);
export default r;
