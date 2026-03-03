import { CreateUserDto } from "../../dtos/user_dtos/auth.dtos";
import z from "zod"
import { Request, Response } from "express";
import { AdminUserService } from "../../services/admin_services/admin.service";
import { LikeService } from "../../services/song_services/like.service";
let adminUserService = new AdminUserService();
let likeService = new LikeService();

export class AdminUserController{
    async createUser(req:Request, res: Response){
        try{
            const parsedData=CreateUserDto.safeParse(req.body);
            if(!parsedData.success){
                return res.status(400).json({
                    success: false, message: z.prettifyError(parsedData.error)
                });
            }
            const newUser= await adminUserService.createUser(parsedData.data);
            return res.status(201).json({
                success:true, data: newUser, message:"Created User Successfully"}
            )}catch( error:Error | any){ 
            return res.status(error.statusCode || 500).json(
                {success:false, message: error.message || "Internal Server Error"});
            }
    }

    async getAllUsers(req: Request, res: Response) {
        try {
            const users = await adminUserService.getAllUsers();
            return res.status(200).json({ success: true, data: users });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Internal Server Error" });
        }
    }

    async getUserById(req: Request, res: Response) {
        try {
            const user = await adminUserService.getUserById(req.params.id);
            return res.status(200).json({ success: true, data: user });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Internal Server Error" });
        }
    }

    async updateUser(req: Request, res: Response) {
        try {
            const updatedUser = await adminUserService.updateUser(req.params.id, req.body);
            return res.status(200).json({ success: true, data: updatedUser, message: "Updated User Successfully" });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Internal Server Error" });
        }
    }

    async deleteUser(req: Request, res: Response) {
        try {
            const deletedUser = await adminUserService.deleteUser(req.params.id);
            return res.status(200).json({ success: true, data: deletedUser, message: "Deleted User Successfully" });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Internal Server Error" });
        }
    }

    async cleanOrphanedLikes(req: Request, res: Response) {
        try {
            const result = await likeService.cleanOrphanedLikes();
            return res.status(200).json({ success: true, data: result, message: result.message });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Internal Server Error" });
        }
    }
}