import { UserRepository } from "../repositories/auth.repository";
import { CreateUserDto, LoginUserDto, UpdateUserDto } from "../dtos/auth.dtos";
import bcrypt from 'bcryptjs';
import { HttpError } from "../errors/http-error";
import { JWT_SECRET } from "../config";
import jwt from 'jsonwebtoken';


let userRepository=new UserRepository
export class AuthService{
    async registerUser(data : CreateUserDto){
        //logic to register user, duplicate check, hash
        const emailExists= await userRepository.getUserByEmail(data.email);
        if(emailExists){
            throw new HttpError(409,"Email already registered");
        }
        const usernameExists= await userRepository.getUserByUsername(data.username);
        if(usernameExists){
            throw new HttpError(409,"Username already exists");
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(data.password, 10);//10-complexity
        data.password=hashedPassword; // replace plain text with hashed password
        
        const newUser= await userRepository.createUser(data);
        return newUser;
    }

    async loginUser(data: LoginUserDto){
        const user = await userRepository.getUserByEmail(data.email);
        if(!user){
            throw new HttpError(404,"User not found");
        }
        const validPassword =  await bcrypt.compare(data.password,user.password)
        if(!validPassword){
            throw new HttpError(401, "Invalid password");
        }
        // Generate JWT token
       const payload = {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role
       };
       const token =  jwt.sign(payload, JWT_SECRET, {expiresIn:'30d'});
       return {token, user};
    }
    async getUserById(userId:string){
        if (!userId){
            throw new HttpError(400, "User ID is required");
        }
        const user =await userRepository.getUserById(userId);
        if(!user){
            throw new HttpError(404, "User not found");
        }
        return user;
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