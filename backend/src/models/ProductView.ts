import { Schema, model, InferSchemaType } from "mongoose";

const ProductViewSchema = new Schema(
  {
    product_id: { type: String, required: true },
    user_id: { type: String, default: null },
    session_id: { type: String },
    viewed_at: { type: Date, default: Date.now },
    source: {
      type: String,
      enum: ["catalog", "home", "search", "direct"],
      default: "direct",
    },
    duration_seconds: { type: Number, default: 0 },
  },
  { versionKey: false }
);

ProductViewSchema.index({ product_id: 1, viewed_at: -1 });
ProductViewSchema.index({ user_id: 1 });
// TTL: documentos expiran 90 días tras viewed_at
ProductViewSchema.index({ viewed_at: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

export type ProductViewDoc = InferSchemaType<typeof ProductViewSchema>;
export const ProductView = model("ProductView", ProductViewSchema);
