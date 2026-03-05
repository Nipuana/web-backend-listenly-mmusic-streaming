import { Request, Response } from "express";
import z from "zod";
import {
    AdminReviewArtistVerificationRequestDto,
} from "../../dtos/user_dtos/artistVerificationRequest.dtos";
import { ArtistVerificationRequestService } from "../../services/user_services/artistVerificationRequest.service";

const service = new ArtistVerificationRequestService();

export class AdminArtistVerificationRequestController {
    async list(req: Request, res: Response) {
        try {
            const status = typeof req.query.status === "string" ? req.query.status : undefined;
            const requests = await service.listRequests(status);
            return res.status(200).json({ success: true, data: requests });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }

    async approve(req: Request, res: Response) {
        try {
            const adminId = req.user?._id?.toString?.();
            if (!adminId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const parsed = AdminReviewArtistVerificationRequestDto.safeParse(req.body ?? {});
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
            }

            const updated = await service.approveRequest(adminId, req.params.id, parsed.data.adminNote);
            return res.status(200).json({
                success: true,
                data: updated,
                message: "Artist verification request approved",
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }

    async decline(req: Request, res: Response) {
        try {
            const adminId = req.user?._id?.toString?.();
            if (!adminId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const parsed = AdminReviewArtistVerificationRequestDto.safeParse(req.body ?? {});
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
            }

            const updated = await service.declineRequest(adminId, req.params.id, parsed.data.adminNote);
            return res.status(200).json({
                success: true,
                data: updated,
                message: "Artist verification request declined",
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
}
