import { AuthService } from "../services/auth.service";
import { CreateUserDto, LoginUserDto, UpdateUserDto } from "../dtos/auth.dtos";
import { UserRepository } from "../repositories/auth.repository";
import  z, { success } from "zod";
import { Request, Response } from "express";
import { HttpError } from "../errors/http-error";
import bcrypt from "bcryptjs/umd/types";
let authService = new AuthService();
let userRepository = new UserRepository();
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
            return res.status(error.statusCode).json(
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
            return res.status(error.statusCode).json(
                {success:false, message: error.message || "Internal Server Error"});
        }
    }

async updateUser(userId: string, data: UpdateUserDto){
        const user = await userRepository.getUserById(userId);
        if(!user){
            throw new HttpError(404, "User not found");
        }
        if(user.email !== data.email){
            const emailExists = await userRepository.getUserByEmail(data.email!);
            if(emailExists){
                throw new HttpError(409, "Email already exists");
            }
        }
        if(user.username !== data.username){
            const usernameExists = await userRepository.getUserByUsername(data.username!);
            if(usernameExists){
                throw new HttpError(409, "Username already exists");
            }
        }
        if(data.password){
            const hashedPassword = await bcrypt.hash(data.password, 10);
            data.password = hashedPassword;
        }
        const updatedUser = await userRepository.updateUserById(userId, data);
        return updatedUser;
    }
}