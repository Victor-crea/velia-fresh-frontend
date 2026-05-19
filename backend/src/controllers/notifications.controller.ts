import { Response, NextFunction } from "express";
import { Notification } from "../models/Notification";
import { AuthedRequest, ok } from "../models/types";
import { HttpError } from "../middlewares/errorHandler";

/** GET /api/notifications/my  [auth] — últimas 50 */
export async function myNotifications(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, "No autenticado");
    const list = await Notification.find({ user_id: req.user.id })
      .sort({ created_at: -1 }).limit(50).lean();
    res.json(ok(list));
  } catch (e) { next(e); }
}

/** PATCH /api/notifications/:id/read  [auth] */
export async function markRead(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, "No autenticado");
    const updated = await Notification.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.id },
      { $set: { read: true } },
      { new: true }
    );
    if (!updated) throw new HttpError(404, "Notificación no encontrada", "NOT_FOUND");
    res.json(ok(updated));
  } catch (e) { next(e); }
}

/** GET /api/notifications/unread-count  [auth] */
export async function unreadCount(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, "No autenticado");
    const count = await Notification.countDocuments({ user_id: req.user.id, read: false });
    res.json(ok({ count }));
  } catch (e) { next(e); }
}
