import { Schema, model, InferSchemaType } from "mongoose";

const NotificationSchema = new Schema(
  {
    user_id: { type: String, required: true },
    type: {
      type: String,
      enum: ["order_status", "promo", "restock"],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    data: { type: Schema.Types.Mixed, default: {} },
    read: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

NotificationSchema.index({ user_id: 1, read: 1, created_at: -1 });

export type NotificationDoc = InferSchemaType<typeof NotificationSchema>;
export const Notification = model("Notification", NotificationSchema);
