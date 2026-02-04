import { UserInfoService } from "../services/userInfo.service";
import { UpdateUserInfoDto } from "../dtos/userInfo.dtos";
import z from "zod";
import { Request, Response } from "express";

let userInfoService = new UserInfoService();

export class UserInfoController {
    async updateAdditionalInfo(req: Request, res: Response) {
        try {
            const userId = req.user?._id;
            if (!userId) {
                return res.status(401).json({
                    success: false, message: "Unauthorized"
                });
            }

            const parsedData = UpdateUserInfoDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false, message: z.prettifyError(parsedData.error)
                });
            }

            const updatedUser = await userInfoService.updateUserInfo(userId, parsedData.data);
            return res.status(200).json({
                success: true, data: updatedUser, message: "Additional information updated successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false, message: error.message || "Internal Server Error"
            });
        }
    }

    async getAdditionalInfo(req: Request, res: Response) {
        try {
            const userId = req.user?._id;
            if (!userId) {
                return res.status(401).json({
                    success: false, message: "Unauthorized"
                });
            }

            const additionalInfo = await userInfoService.getUserInfo(userId);
            return res.status(200).json({
                success: true, data: additionalInfo, message: "Additional information fetched successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false, message: error.message || "Internal Server Error"
            });
        }
    }

    async clearAdditionalInfo(req: Request, res: Response) {
        try {
            const userId = req.user?._id;
            if (!userId) {
                return res.status(401).json({
                    success: false, message: "Unauthorized"
                });
            }

            const updatedUser = await userInfoService.clearUserInfo(userId);
            return res.status(200).json({
                success: true, data: updatedUser, message: "Additional information cleared successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false, message: error.message || "Internal Server Error"
            });
        }
    }
}
