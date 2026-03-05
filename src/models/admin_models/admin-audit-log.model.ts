import mongoose, { Document, Schema } from "mongoose";

export interface IAdminAuditLog extends Document {
    adminId: mongoose.Types.ObjectId;
    action: string;
    method: string;
    path: string;
    params?: Record<string, any>;
    query?: Record<string, any>;
    body?: Record<string, any>;
    statusCode: number;
    success: boolean;
    ip?: string;
    userAgent?: string;
    durationMs: number;
    createdAt: Date;
    updatedAt: Date;
}

const AdminAuditLogSchema: Schema = new Schema(
    {
        adminId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        action: { type: String, required: true },
        method: { type: String, required: true },
        path: { type: String, required: true },
        params: { type: Schema.Types.Mixed, required: false },
        query: { type: Schema.Types.Mixed, required: false },
        body: { type: Schema.Types.Mixed, required: false },
        statusCode: { type: Number, required: true },
        success: { type: Boolean, required: true },
        ip: { type: String, required: false },
        userAgent: { type: String, required: false },
        durationMs: { type: Number, required: true },
    },
    { timestamps: true }
);

AdminAuditLogSchema.index({ adminId: 1, createdAt: -1 });
AdminAuditLogSchema.index({ action: 1, createdAt: -1 });

export const AdminAuditLogModel = mongoose.model<IAdminAuditLog>("AdminAuditLog", AdminAuditLogSchema);
