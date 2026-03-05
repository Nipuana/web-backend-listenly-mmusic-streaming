import { HttpError } from "../../errors/http-error";
import { AdminAuditLogRepository } from "../../repositories/admin_repositories/adminAuditLog.repository";

const repo = new AdminAuditLogRepository();

export class AdminAuditLogService {
    async list(query: { page?: any; limit?: any; action?: any; adminId?: any }) {
        const page = query.page ? parseInt(String(query.page), 10) : 1;
        const limit = query.limit ? parseInt(String(query.limit), 10) : 50;

        if (Number.isNaN(page) || page < 1) throw new HttpError(400, "Invalid page");
        if (Number.isNaN(limit) || limit < 1 || limit > 200) throw new HttpError(400, "Invalid limit");

        const action = typeof query.action === "string" && query.action.trim() ? query.action.trim() : undefined;
        const adminId = typeof query.adminId === "string" && query.adminId.trim() ? query.adminId.trim() : undefined;

        return repo.list({ page, limit, action, adminId });
    }

    async getById(id?: string) {
        if (!id) throw new HttpError(400, "Audit log id is required");
        const log = await repo.getById(id);
        if (!log) throw new HttpError(404, "Audit log not found");
        return log;
    }
}
