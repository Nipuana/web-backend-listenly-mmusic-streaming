import { Request, Response } from "express";
import z from "zod";
import {
    CreateArtistVerificationRequestDto,
} from "../../dtos/user_dtos/artistVerificationRequest.dtos";
import { ArtistVerificationRequestService } from "../../services/user_services/artistVerificationRequest.service";

const service = new ArtistVerificationRequestService();

export class ArtistVerificationRequestController {
    async submit(req: Request, res: Response) {
        try {
            const userId = req.user?._id?.toString?.();
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const parsed = CreateArtistVerificationRequestDto.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
            }

            const created = await service.submitRequest(userId, parsed.data);
            return res.status(201).json({
                success: true,
                data: created,
                message: "Artist verification request submitted",
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }

    async myLatest(req: Request, res: Response) {
        try {
            const userId = req.user?._id?.toString?.();
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const latest = await service.getMyLatestRequest(userId);
            return res.status(200).json({ success: true, data: latest });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
}
