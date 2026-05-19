import { Notification } from "../models/Notification";

interface NotifyInput {
  user_id: string;
  type: "order_status" | "promo" | "restock";
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

/**
 * Crea una notificación para un usuario.
 */
export async function notifyUser(input: NotifyInput) {
  return Notification.create({
    user_id: input.user_id,
    type: input.type,
    title: input.title,
    body: input.body,
    data: input.data ?? {},
    read: false,
    created_at: new Date(),
  });
}
