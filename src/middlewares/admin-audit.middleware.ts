import { Request, Response, NextFunction } from "express";
import { AdminAuditLogModel } from "../models/admin_models/admin-audit-log.model";

const SENSITIVE_KEYS = new Set([
    "password",
    "confirmPassword",
    "token",
    "accessToken",
    "refreshToken",
    "authorization",
]);

function sanitizeObject(value: any, depth: number = 0): any {
    if (depth > 3) return "[Truncated]";
    if (value === null || value === undefined) return value;
    if (Array.isArray(value)) return value.slice(0, 20).map((v) => sanitizeObject(v, depth + 1));
    if (typeof value !== "object") return value;

    const output: Record<string, any> = {};
    for (const [key, val] of Object.entries(value)) {
        if (SENSITIVE_KEYS.has(key)) {
            output[key] = "[Redacted]";
            continue;
        }
        // Avoid logging raw buffers/files
        if (key === "file" || key === "files") {
            output[key] = "[Omitted]";
            continue;
        }
        output[key] = sanitizeObject(val, depth + 1);
    }
    return output;
}

/**
 * Logs an admin action to MongoDB after the response finishes.
 * Safe default: it only logs when req.user.role === 'admin'.
 */
export function auditAdminAction(action: string) {
    return function adminAuditMiddleware(req: Request, res: Response, next: NextFunction) {
        const start = Date.now();

        res.on("finish", async () => {
            try {
                const user: any = req.user;
                if (!user || user.role !== "admin") return;

                // Don't audit-log read-only requests (e.g. "get all" endpoints)
                if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") return;

                await AdminAuditLogModel.create({
                    adminId: user._id,
                    action,
                    method: req.method,
                    path: req.originalUrl,
                    params: sanitizeObject(req.params),
                    query: sanitizeObject(req.query),
                    body: sanitizeObject(req.body),
                    statusCode: res.statusCode,
                    success: res.statusCode < 400,
                    ip: req.ip,
                    userAgent: req.headers["user-agent"],
                    durationMs: Date.now() - start,
                });
            } catch {
                // Never block requests because of audit logging
            }
        });

        return next();
    };
}
