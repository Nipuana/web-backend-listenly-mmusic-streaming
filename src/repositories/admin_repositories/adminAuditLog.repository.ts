import { AdminAuditLogModel, IAdminAuditLog } from "../../models/admin_models/admin-audit-log.model";

export class AdminAuditLogRepository {
    async list(options: {
        page: number;
        limit: number;
        action?: string;
        adminId?: string;
    }): Promise<{ logs: IAdminAuditLog[]; total: number }> {
        const { page, limit, action, adminId } = options;
        const filter: Record<string, any> = {};
        if (action) filter.action = action;
        if (adminId) filter.adminId = adminId;

        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            AdminAuditLogModel.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("adminId", "email username role"),
            AdminAuditLogModel.countDocuments(filter),
        ]);

        return { logs, total };
    }

    async getById(id: string): Promise<IAdminAuditLog | null> {
        return AdminAuditLogModel.findById(id).populate("adminId", "email username role");
    }
}
