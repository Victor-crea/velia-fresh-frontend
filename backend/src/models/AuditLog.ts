import { Schema, model, InferSchemaType } from "mongoose";

const AuditLogSchema = new Schema(
  {
    action: { type: String, required: true, index: true },
    entity: { type: String, required: true },
    entity_id: { type: String, required: true },
    user_id: { type: String, required: true },
    user_role: { type: String, default: "cliente" },
    payload: { type: Schema.Types.Mixed },
    ip: { type: String },
    user_agent: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

AuditLogSchema.index({ user_id: 1, timestamp: -1 });
AuditLogSchema.index({ entity: 1, entity_id: 1 });

export type AuditLogDoc = InferSchemaType<typeof AuditLogSchema>;
export const AuditLog = model("AuditLog", AuditLogSchema);
