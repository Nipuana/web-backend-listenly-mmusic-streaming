import { CreateUserDto } from "../../dtos/auth.dtos";
import z from "zod"
import { Request, Response } from "express";
import { AdminUserService } from "../../services/admin/admin.service";
let adminUserService = new AdminUserService();

export class AdminUserController{
    async createUser(req:Request, res: Response){
         try{
                    const pasedData=CreateUserDto.safeParse(req.body);
                    if(!pasedData.success){
                        return res.status(400).json({
                            success: false, message: z.prettifyError(pasedData.error)
                        });
                    }
                    const newUser= await adminUserService.createUser(pasedData.data);
                    return res.status(201).json({
                        success:true, data: newUser, message:" Created Admin Successfully"}
                    )}catch( error:Error | any){ 
                    return res.status(error.statusCode).json(
                        {success:false, message: error.message || "Internal Server Error"});
                    }
        // 1. Validate
        // 2. Call Service- reuse AuthService.registerUser
        // 3. Handle response
        
}
}