import { Request, Response } from "express";
import { AdminAuditLogService } from "../../services/admin_services/adminAuditLog.service";

const service = new AdminAuditLogService();

export class AdminAuditLogController {
    async list(req: Request, res: Response) {
        try {
            const { logs, total } = await service.list(req.query);
            return res.status(200).json({
                success: true,
                data: logs,
                total,
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const log = await service.getById(req.params.id);
            return res.status(200).json({
                success: true,
                data: log,
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
}
