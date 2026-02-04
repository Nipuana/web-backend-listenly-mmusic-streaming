import { AuthService } from "../services/auth.service";
import { CreateUserDto, LoginUserDto, UpdateUserDto } from "../dtos/auth.dtos";
import  z, { success } from "zod";
import { Request, Response } from "express";

let authService = new AuthService();
export class AuthController{

    async registerUser(req: Request, res: Response){
        try{
            const parsedData=CreateUserDto.safeParse(req.body);
            if(!parsedData.success){
                return res.status(400).json({
                    success: false, message: z.prettifyError(parsedData.error)
                });
            }

            const newUser= await authService.registerUser(parsedData.data);
            return res.status(201).json({
                success:true, data: newUser, message:" Registered Successfully"}
            )}catch( error:Error | any){ 
            return res.status(error.statusCode || 500).json(
                {success:false, message: error.message || "Internal Server Error"});
            }
    }
    async loginUser(req: Request, res: Response){
        try{
            const parsedData= LoginUserDto.safeParse(req.body);
            if(!parsedData.success){
                return res.status(400).json({
                    success:false, message: z.prettifyError(parsedData.error)
                });
            }
            const { token, user }= await authService.loginUser(parsedData.data);
            return res.status(200).json(
                { success:true, data: user, token, message: "Login Successful"}
            );

        }catch(error: Error | any){
            return res.status(error.statusCode).json(
                {success:false, message: error.message || "Internal Server Error"});
        }
    };

async getUserById(req:Request, res:Response){
    try{
        const userId= req.user?._id ;
        if(!userId){
            return res.status(200).json(
                {
                    success:false, message: "Unauthorized"
                }
            
            )
        }
        const user= await authService.getUserById(userId);
        return res.status(200).json(
            {
                success:true, data: user, message: "Profile fetched successfully"
            }
        );
        
    }catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                {success:false, message: error.message || "Internal Server Error"});
        }
    }

async updateUser(req: Request, res: Response){
        try{
            const userId = req.user?._id;
            if(!userId){
                return res.status(401).json(
                    { success: false, message: "Unauthorized" }
                )
            }
            const parsedData = UpdateUserDto.safeParse(req.body);
            if(!parsedData.success){
                return res.status(400).json(
                    { success: false, message: z.prettifyError(parsedData.error) }
                )
            }
            if(req.file){
                parsedData.data.profilePicture = `/uploads/images/pfp/${req.file.filename}`;
            }
            const updatedUser = await authService.updateUser(userId, parsedData.data);
            return res.status(200).json(
                { success: true, data: updatedUser, message: "User updated successfully" }
            )
        }catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                {success:false, message: error.message || "Internal Server Error"});
        }
    }
    async sendResetPasswordEmail(req: Request, res: Response) {
        try {
            const email = req.body.email;
            const user = await authService.sendResetPasswordEmail(email);
            return res.status(200).json(
                { success: true,
                    data: user,
                    message: "If the email is registered, a reset link has been sent." }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    async resetPassword(req: Request, res: Response) {
        try {

           const token = req.params.token;
            const { newPassword } = req.body;
            await authService.resetPassword(token, newPassword);
            return res.status(200).json(
                { success: true, message: "Password has been reset successfully." }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }
}